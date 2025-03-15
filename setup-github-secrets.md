# Setting Up GitHub Secrets for Semantic Release

To enable automated releases with semantic-release, you need to set up the following GitHub repository secrets:

## Required Secrets

1. **GH_TOKEN**: A GitHub Personal Access Token (PAT) with the following permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)

2. **NPM_TOKEN**: An npm token if you're publishing to npm (optional for private repositories)

## Steps to Create and Add Secrets

### 1. Create a GitHub Personal Access Token (PAT)

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

### 2. Add Secrets to Your GitHub Repository

1. Go to your repository on GitHub
2. Click on "Settings"
3. Click on "Secrets and variables" in the left sidebar, then "Actions"
4. Click "New repository secret"
5. Add the following secrets:
   - Name: `GH_TOKEN`
   - Value: [Your GitHub PAT from step 1]
   - Click "Add secret"

6. If you're publishing to npm, also add:
   - Name: `NPM_TOKEN`
   - Value: [Your npm token]
   - Click "Add secret"

## Verifying Setup

After setting up the secrets, push a commit to the `main` branch to trigger the release workflow. You can check the workflow execution in the "Actions" tab of your repository.

## Troubleshooting

If the release workflow fails, check the following:

1. Ensure your PAT has the correct permissions
2. Verify that the secrets are correctly named in the repository settings
3. Check the workflow logs for specific error messages 