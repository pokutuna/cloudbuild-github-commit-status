cloudbuild-github-commit-status
===

* You should use the official GitHubApp if you can.*

[Google Cloud Build · GitHub Marketplace](https://github.com/marketplace/google-cloud-build)

... If you have some problems like [`cloudbuild.yaml` positions](https://github.com/GoogleCloudPlatform/cloud-builders/issues/503) in your repository, try this function.

### Add trigger

- Add trigger from https://console.cloud.google.com/cloud-build/triggers
- select "Cloud Build configuration file (yaml or json)" and set `cloudbuild.yaml` location.

### Get GitHub Personal Access Tokens

- Generate new token from https://github.com/settings/tokens
- check `repo:status` scope

### Deploy

    $ gcloud functions deploy updateCommitStatus --runtime nodejs10 --trigger-topic cloud-builds --set-env-vars GITHUB_TOKEN=******,VERBOSE=true

### Variables

- `GITHUB_TOKEN` (required)
- `VERBOSE`
- `BUILD_CONTEXT`
