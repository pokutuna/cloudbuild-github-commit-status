cloudbuild-github-commit-status
===

## Deploy

    $ gcloud functions deploy updateCommitStatus --runtime nodejs10 --trigger-topic cloud-builds --set-env-vars GITHUB_TOKEN=******,VERBOSE=true 
