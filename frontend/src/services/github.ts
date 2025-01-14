import axios from "axios";
import { Endpoints } from "@octokit/types";

export const LOCAL_STORAGE_GITHUB_TOKEN = "github_token";

type CommitResponse =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"];

type ContentResponse =
  Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"];

const getRequestHeaders = () => {
  const githubAccessToken = localStorage.getItem(LOCAL_STORAGE_GITHUB_TOKEN);
  if (githubAccessToken) {
    return {
      Authorization: `bearer ${githubAccessToken}`,
    };
  } else {
    return {};
  }
};

export const getCommitFiles = async (
  owner: string,
  repo: string,
  commitSHA: string
) => {
  const headers = getRequestHeaders();
  const response = await axios.get<CommitResponse["data"]>(
    `https://api.github.com/repos/${owner}/${repo}/commits/${commitSHA}`,
    { headers }
  );
  if (response.status !== 200) {
    throw new Error("Error fetching commit content");
  }
  return response?.data?.files;
};

export const parseGithubUrl = (url: string) => {
  let regex =
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/([^/]+)\/commits\/([^/]+)/;
  let match = url.match(regex);
  if (match) {
    const [, owner, repo, pullRequest, commitSHA] = match;
    return { owner, repo, pullRequest, commitSHA };
  } else {
    regex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/commit\/([^/]+)/;
    match = url.match(regex);
    if (match) {
      const [, owner, repo, commitSHA] = match;
      return { owner, repo, commitSHA };
    } else {
      throw new Error("Invalid GitHub URL");
    }
  }
};

export const getCsvHeaders = async (contentUrl: string) => {
  const headers = getRequestHeaders();
  const response = await axios.get<ContentResponse["data"]>(contentUrl, {
    headers,
  });
  if (response.status !== 200) {
    throw new Error("Error fetching commit content");
  }
  if ("content" in response.data) {
    const content = response.data.content;
    const headerString = atob(content).split("\n")[0];
    return headerString.split(",").map((header) => header.trim()) || [];
  } else {
    throw new Error("Error fetching commit content");
  }
};
