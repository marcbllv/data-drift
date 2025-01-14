package github

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/data-drift/data-drift/common"
	"github.com/data-drift/data-drift/database/notion_database"
	"github.com/data-drift/data-drift/history"
	"github.com/data-drift/data-drift/reducers"
	"github.com/data-drift/data-drift/reports"
	"github.com/gin-gonic/gin"
	"github.com/google/go-github/v42/github"
	"github.com/xeipuuv/gojsonschema"
)

const configFilePath = "datadrift-config.json"

type GithubWebhookPayload struct {
	Repository struct {
		Name  string `json:"name"`
		Owner struct {
			Name string `json:"name"`
		} `json:"owner"`
	} `json:"repository"`
	Repositories []struct {
		Name string `json:"name"`
	} `json:"repositories"`

	Installation struct {
		ID      int `json:"id"`
		Account struct {
			Login string `json:"login"`
		} `json:"account"`
	} `json:"installation"`
}

func HandleWebhook(c *gin.Context) {
	var payload GithubWebhookPayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusNotAcceptable, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("Installation ID: ", payload.Installation.ID)

	InstallationId := payload.Installation.ID
	client, err := CreateClientFromGithubApp(int64(InstallationId))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	ctx := context.Background()

	var ownerName, repoName string

	if payload.Repository.Owner.Name != "" {
		ownerName = payload.Repository.Owner.Name
		repoName = payload.Repository.Name
	} else if payload.Installation.Account.Login != "" {
		ownerName = payload.Installation.Account.Login
		repoName = payload.Repositories[0].Name
	} else {
		fmt.Println("No repository or account found")
		c.JSON(http.StatusBadRequest, gin.H{"error": "No repository or account found"})
		return
	}

	config, err := VerifyConfigFile(client, ownerName, repoName, ctx)

	fmt.Println("config", config)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("config", config)
	c.JSON(http.StatusOK, gin.H{"message": "Webhook processed", "configIsValie": config, "installationId": InstallationId})

	// Call functions from charts.go and reports.go
	go processWebhookInTheBackground(config, c, InstallationId, client, ownerName, repoName)

}

func processWebhookInTheBackground(config common.Config, c *gin.Context, InstallationId int, client *github.Client, ownerName string, repoName string) bool {

	fmt.Println("starting sync")

	err := notion_database.AssertDatabaseHasDatadriftProperties(config.NotionDatabaseID, config.NotionAPIToken)

	if err != nil {
		fmt.Println("[DATADRIFT_ERROR] db notion", err.Error())
	}

	for _, metric := range config.Metrics {

		filepath, err := history.ProcessHistory(client, ownerName, repoName, metric, InstallationId)
		if err != nil {
			fmt.Println("[DATADRIFT_ERROR] process history", err.Error())

		}

		chartResults := reducers.ProcessMetricHistory(filepath, metric)

		for _, chartResult := range chartResults {
			err = reports.CreateReport(common.SyncConfig{NotionAPIKey: config.NotionAPIToken, NotionDatabaseID: config.NotionDatabaseID}, chartResult)
			if err != nil {
				fmt.Println("[DATADRIFT_ERROR] create report", err.Error())
			}
		}

		metadataChartResults, metadataChartError := reducers.ProcessMetricMetadataCharts(filepath, metric)
		if metadataChartError != nil {
			fmt.Println("[DATADRIFT_ERROR] create summary report", metadataChartError.Error())
		} else {
			reports.CreateSummaryReport(common.SyncConfig{NotionAPIKey: config.NotionAPIToken, NotionDatabaseID: config.NotionDatabaseID}, metric, metadataChartResults)
		}
	}
	return false
}

func VerifyConfigFile(client *github.Client, RepoOwner string, RepoName string, ctx context.Context) (common.Config, error) {

	commit, _, _ := client.Repositories.GetCommit(ctx, RepoOwner, RepoName, "main", nil)

	file, _, _, err := client.Repositories.GetContents(ctx, RepoOwner, RepoName, configFilePath, &github.RepositoryContentGetOptions{
		Ref: *commit.SHA,
	})

	if err != nil {
		fmt.Println("[DATADRIFT_ERROR]", err.Error())
		return common.Config{}, err
	}
	content, _ := file.GetContent()
	schemaLoader := gojsonschema.NewReferenceLoader("file://./json-schema.json")
	documentLoader := gojsonschema.NewStringLoader(content)

	result, err := gojsonschema.Validate(schemaLoader, documentLoader)
	if err != nil {
		fmt.Println("[DATADRIFT_ERROR]", err.Error())
		return common.Config{}, err
	}
	if result.Errors() != nil {
		fmt.Println("result.Errors()", result.Errors())
		return common.Config{}, fmt.Errorf("invalid config file")
	}
	fmt.Println(result.Valid())
	var config common.Config
	if err := json.Unmarshal([]byte(content), &config); err != nil {
		fmt.Println("[DATADRIFT_ERROR]", err.Error())
		return common.Config{}, err
	}
	return config, nil
}

func ValidateConfigHandler(c *gin.Context) {
	// Parse the JSON configuration from the request body
	var config common.Config
	err := c.ShouldBindJSON(&config)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON configuration"})
		return
	}

	schemaLoader := gojsonschema.NewReferenceLoader("file://./json-schema.json")
	schema, err := gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": "Failed to load JSON Schema"})

		return
	}

	// Validate the configuration against the JSON Schema
	configLoader := gojsonschema.NewGoLoader(config)
	result, err := schema.Validate(configLoader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": err})
		return
	}

	// Check validation results
	if !result.Valid() {
		validationErrors := make([]string, len(result.Errors()))
		for i, desc := range result.Errors() {
			validationErrors[i] = desc.String()
		}
		c.JSON(http.StatusBadRequest, gin.H{"errors": validationErrors})
		return
	}

	// Configuration is valid
	c.JSON(http.StatusOK, gin.H{"message": "Configuration is valid"})
}
