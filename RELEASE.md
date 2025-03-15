# Release Process

This document describes the release process for SpellBuddy.

## Automated Releases with semantic-release

SpellBuddy uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate the release process. This includes:

- Determining the next version number
- Generating release notes
- Creating a GitHub release
- Updating the CHANGELOG.md file
- Updating the version in package.json

## How It Works

1. When code is pushed to the `main` branch, the GitHub Actions workflow in `.github/workflows/release.yml` is triggered.
2. The workflow analyzes commit messages to determine the next version number:
   - `fix` type commits trigger a PATCH release (e.g., 1.0.0 → 1.0.1)
   - `feat` type commits trigger a MINOR release (e.g., 1.0.0 → 1.1.0)
   - `feat` commits with a `BREAKING CHANGE` footer trigger a MAJOR release (e.g., 1.0.0 → 2.0.0)
3. A new version is created automatically.
4. The CHANGELOG.md file is updated with the release notes.
5. A new GitHub release is created.
6. The package.json version is updated.

## Preparing for a Release

To prepare for a release, you can use the provided script:

```shell
npm run prepare-release
```

This script will:
1. Check that your git working directory is clean
2. Run all tests to ensure they pass
3. Verify that the achievement system is working correctly
4. Test the semantic-release configuration
5. Provide guidance on creating a proper release commit

After running this script and addressing any issues, you can create a commit with the appropriate type (fix, feat, etc.) and push it to the main branch to trigger a release.

## Authentication

The release process uses GitHub's default `GITHUB_TOKEN` that is automatically provided to GitHub Actions workflows. This token has the necessary permissions to:

- Create releases
- Push commits to the repository
- Create tags

For most cases, no additional setup is required as the workflow has been configured to use this default token.

If you need more permissions (such as triggering other workflows), you can set up a Personal Access Token (PAT) as described in [setup-github-secrets.md](setup-github-secrets.md).

## Conventional Commits

The automated release process relies on [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This enables automatic versioning and changelog generation.

### Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details on the commit message format.

## Manual Release

In most cases, the release process is automated. However, if you need to trigger a release manually:

```shell
npm run semantic-release
```

## Testing the Release Configuration

To test the semantic-release configuration locally without actually creating a release:

```shell
npm run test-release
```

This will run semantic-release in dry-run mode and show you what would happen during a real release.

## Troubleshooting

If the release workflow fails, check the following:

1. **Authentication Issues**:
   - Ensure the workflow has the correct permissions in the workflow file
   - Check that the `permissions` section is properly configured
   - Verify that the repository settings allow GitHub Actions to create releases

2. **Repository Configuration**:
   - Check if your repository has any branch protection rules that might interfere
   - Ensure the main branch is properly configured as the release branch

3. **Commit Messages**:
   - Ensure your commit messages follow the Conventional Commits format
   - At least one commit should trigger a release (e.g., `fix:` or `feat:`)

4. **Debugging**:
   - Run the workflow with the `--debug` flag to get more detailed logs
   - Use the test-release script locally to verify the configuration

5. **Common Errors**:
   - `ENOGHTOKEN`: No GitHub token specified or token doesn't have required permissions
   - `EGITNOPERMISSION`: Cannot push to the Git repository due to permission issues
   - `ENOGITHEAD`: No Git tag found, usually due to shallow clone 