import { getCommitFiles, getCsvHeaders } from "../services/github";
import { DualTable, DualTableProps } from "../components/Table/DualTable";
import { parsePatch } from "../services/patch.mapper";
import { Params, useLoaderData } from "react-router";
import { getPatchAndHeader } from "../services/data-drift";

export interface CommitInfo {
  owner: string;
  repo: string;
  commitSHA: string;
}

function assertParamsIsCommitInfo(params: Params<string>): CommitInfo {
  const { owner, repo, commitSHA } = params;
  if (!owner || !repo || !commitSHA) {
    throw new Error("Invalid params");
  }
  return { owner, repo, commitSHA };
}

function assertParamsHasInstallationIs(
  params: Params<string>
): CommitInfo & { installationId: string } {
  const { installationId, owner, repo, commitSHA } = params;
  if (!installationId || !owner || !repo || !commitSHA) {
    throw new Error("Invalid params");
  }
  return { installationId, owner, repo, commitSHA };
}

const getCommitDiffFromGithub = async ({
  params,
}: {
  params: Params<string>;
}) => {
  const { owner, repo, commitSHA } = assertParamsIsCommitInfo(params);
  const files = await getCommitFiles(owner, repo, commitSHA);
  if (!files) {
    throw new Error("No files found");
  }
  const file = files[0];
  if (file && file.patch) {
    const headers = await getCsvHeaders(file.contents_url);
    const { oldData, newData } = parsePatch(file.patch, headers);
    return { tableProps1: oldData, tableProps2: newData };
  }
};

const getCommitDiffFromDataDrift = async ({
  params,
}: {
  params: Params<string>;
}) => {
  const { installationId, owner, repo, commitSHA } =
    assertParamsHasInstallationIs(params);

  const { patch, headers } = await getPatchAndHeader({
    installationId,
    owner,
    repo,
    commitSHA,
  });
  const { oldData, newData } = parsePatch(patch, headers);
  return { tableProps1: oldData, tableProps2: newData };
};

function DisplayCommit() {
  const results = useLoaderData() as DualTableProps;
  console.log("results", results);

  return <>{results && <DualTable {...results} />}</>;
}

DisplayCommit.githubLoader = getCommitDiffFromGithub;
DisplayCommit.dataDriftLoader = getCommitDiffFromDataDrift;

export default DisplayCommit;
