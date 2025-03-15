# Contributing to SpellBuddy

Thank you for considering contributing to SpellBuddy! This document outlines the process for contributing to the project and how releases are managed.

## Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This enables automatic versioning and changelog generation.

### Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory and must conform to the [Commit Message Header](#commit-message-header) format.

The **body** is optional but recommended for providing additional context.

The **footer** is optional and can be used to reference issue trackers.

#### Commit Message Header

```
<type>(<scope>): <subject>
```

- **type**: Describes the kind of change:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that do not affect the meaning of the code
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding missing tests or correcting existing tests
  - `build`: Changes that affect the build system or external dependencies
  - `ci`: Changes to our CI configuration files and scripts
  - `chore`: Other changes that don't modify src or test files

- **scope**: Optional, can be anything specifying the place of the commit change (e.g., `auth`, `achievements`, `api`)

- **subject**: Brief description of the change

### Using Commitizen

To help format commit messages according to the convention, this project uses [Commitizen](http://commitizen.github.io/cz-cli/):

```bash
npm run commit
```

This will guide you through creating a properly formatted commit message.

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and changelog generation based on commit messages.

### How It Works

1. When code is pushed to the `main` branch, the release workflow is triggered
2. Commit messages are analyzed to determine the next version number:
   - `fix` type commits trigger a PATCH release
   - `feat` type commits trigger a MINOR release
   - `feat` commits with a `BREAKING CHANGE` footer trigger a MAJOR release
3. A new version is created automatically
4. The CHANGELOG.md file is updated with the release notes
5. A new GitHub release is created
6. The package.json version is updated

### Manual Release

In most cases, the release process is automated. However, if you need to trigger a release manually:

```bash
npm run semantic-release
```

## Achievement System

The achievement system is a core part of SpellBuddy. When contributing to the achievement system, please ensure:

1. All achievements follow the established pattern
2. New achievement types are properly documented
3. Database seeding is tested

### Verifying Achievements

To verify and seed achievements:

```bash
npm run db:seed-achievements
```

This will clear the achievements table and re-seed all achievements. 