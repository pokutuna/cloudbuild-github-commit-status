const Octokit = require("@octokit/rest");
const Ajv = require("ajv");
const schema = require("./buildResource.schema.json");

// TODO fix for
const log = (level, message, object) => {
  object = object ? object : {};
  if (process.env.VERBOSE) {
    console[level](
      JSON.stringify({
        severity: level.toUpperCase(),
        message,
        ...object
      })
    );
  }
};

const client = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  baseUrl: process.env.GITHUB_BASE || "https://api.github.com"
});

// Mappings from CloudBuild statuses to GitHub commit statuses
// https://cloud.google.com/cloud-build/docs/api/reference/rest/Shared.Types/Status
// https://developer.github.com/v3/repos/statuses/#create-a-status
const statusMapping = {
  STATUS_UNKNWNON: "pending",
  QUEUED: "pending",
  WORKING: "pending",
  SUCCESS: "success",
  FAILURE: "failure",
  INTERNAL_ERROR: "error",
  TIMEOUT: "error",
  CANCELLED: "error"
};

const decodePubSubData = data =>
  JSON.parse(Buffer.from(data, "base64").toString());

// https://cloud.google.com/cloud-build/docs/api/reference/rest/v1/projects.builds
const validateBuildResource = input => {
  const ajv = new Ajv({ allErrors: true });
  ajv.validate(schema, input);
  return ajv.errors;
};

// https://cloud.google.com/cloud-build/docs/api/reference/rest/Shared.Types/Build?hl=ja#RepoSource
const extractOwnerRepo = repoName => {
  // The repoName is formatted like `github_{owner}_{repo}` when it is triggered by github trigger.
  const match = repoName.match(/^github_([^_]+)_(.+)$/);
  return match ? { owner: match[1], repo: match[2] } : undefined;
};

const formatContext = steps => {
  const step = steps[0];
  return `${step.name}${step.args ? ": " + (step.args || []).join(" ") : ""}`;
};

// https://octokit.github.io/rest.js/#octokit-routes-repos-create-status
// https://octokit.github.io/rest.js/#octokit-routes-checks
module.exports.updateCommitStatus = pubsubEvent => {
  const buildResource = decodePubSubData(pubsubEvent.data);
  log("info", "event.data decoded", buildResource);

  const errors = validateBuildResource(buildResource);
  if (errors) {
    // This validation failure happens by other build tasks. (e.g. building images)
    // This is not a problem, so it's "INFO" level.
    log("info", "validation failed", errors);
    return;
  }

  const repo = buildResource.sourceProvenance.resolvedRepoSource;
  const ownerRepo = extractOwnerRepo(repo.repoName);
  if (!ownerRepo) {
    log("error", `Cannot extract owner and repo: ${repoName}`);
    return;
  }

  const params = {
    ...ownerRepo,
    state: statusMapping[buildResource.status],
    sha: repo.commitSha,
    target_url: buildResource.logUrl,
    context: `CloudBuild:${buildResource.buildTriggerId}`
  };

  log("info", "createStatus", params);
  client.repos.createStatus(params);
};
