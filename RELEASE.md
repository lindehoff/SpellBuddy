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

## Prerequisites

To enable automated releases, you need to set up the following GitHub repository secrets:

1. **GH_TOKEN**: A GitHub Personal Access Token (PAT) with the following permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)

2. **NPM_TOKEN**: An npm token if you're publishing to npm (optional for private repositories)

See [setup-github-secrets.md](setup-github-secrets.md) for detailed instructions on setting up these secrets.

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

```bash
npm run semantic-release
```

## Troubleshooting

If the release workflow fails, check the following:

1. Ensure your PAT has the correct permissions
2. Verify that the secrets are correctly named in the repository settings
3. Check the workflow logs for specific error messages
4. Ensure your commit messages follow the Conventional Commits format 