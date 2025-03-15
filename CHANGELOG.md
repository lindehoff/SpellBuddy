# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automatic achievement verification and seeding in Docker entrypoint
- Verification command in container management script
- Semantic release configuration for automated versioning
- Conventional commits setup with commitlint and husky
- Force seed achievements script for manual database updates

### Fixed
- Achievement visibility in the UI regardless of authentication status
- Database seeding process to ensure achievements are always available
- API endpoint to return all achievements even when not authenticated 