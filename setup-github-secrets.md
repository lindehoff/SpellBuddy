# Setting Up GitHub Secrets for Semantic Release

To enable automated releases with semantic-release, you need to understand how GitHub tokens work with Actions:

## GitHub Tokens

### Default GITHUB_TOKEN

By default, GitHub Actions provides a `GITHUB_TOKEN` secret that is automatically created for your repository. This token has the necessary permissions to:

- Create releases
- Push commits to the repository
- Create tags

For most cases, you don't need to set up any additional secrets as the workflow has been configured to use this default token.

### Limitations of the Default Token

The default `GITHUB_TOKEN` has some limitations:

- It cannot trigger other GitHub Actions workflows
- It has limited permissions outside the current repository

If you need to overcome these limitations, you can set up a Personal Access Token (PAT) as described below.

## Optional: Setting Up a Personal Access Token (PAT)

If you need more permissions than the default token provides, you can set up a Personal Access Token:

1. Go to your GitHub account settings
2. Click on "Developer settings" in the left sidebar
3. Click on "Personal access tokens" and then "Tokens (classic)"
4. Click "Generate new token" and then "Generate new token (classic)"
5. Give your token a descriptive name (e.g., "SpellBuddy Semantic Release")
6. Select the following scopes:
   - `repo` (all checkboxes)
   - `workflow`
7. Click "Generate token"
8. **IMPORTANT**: Copy the token immediately as you won't be able to see it again

### Adding the PAT to Your Repository

1. Go to your repository on GitHub
2. Click on "Settings"
3. Click on "Secrets and variables" in the left sidebar, then "Actions"
4. Click "New repository secret"
5. Add the following secret:
   - Name: `GH_TOKEN`
   - Value: [Your GitHub PAT from step 1]
   - Click "Add secret"

## NPM Token (Optional)

If you're publishing to npm, you'll need to add an NPM token:

1. Create an npm token with publish permissions
2. Add it as a secret named `NPM_TOKEN` in your repository settings

## Verifying Setup

After setting up the secrets (or relying on the default token), push a commit to the `main` branch to trigger the release workflow. You can check the workflow execution in the "Actions" tab of your repository.

## Troubleshooting

If the release workflow fails, check the following:

1. Ensure the workflow has the correct configuration for authentication
2. Check if your repository has any branch protection rules that might interfere
3. Verify that the secrets are correctly named in the repository settings
4. Check the workflow logs for specific error messages 