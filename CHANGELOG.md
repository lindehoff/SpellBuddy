## [3.2.1](https://github.com/lindehoff/SpellBuddy/compare/v3.2.0...v3.2.1) (2025-03-17)


### Bug Fixes

* **script:** improve environment and container handling ([5a62d73](https://github.com/lindehoff/SpellBuddy/commit/5a62d73c7cbd93eb17e38e9cd6bfd17c730fd139))

# [3.2.0](https://github.com/lindehoff/SpellBuddy/compare/v3.1.0...v3.2.0) (2025-03-17)


### Features

* **docker:** add multi-arch support and simplify versioning ([913f293](https://github.com/lindehoff/SpellBuddy/commit/913f2939cafdd01e7569aaa8d23dc39495392b37))

# [3.1.0](https://github.com/lindehoff/SpellBuddy/compare/v3.0.0...v3.1.0) (2025-03-17)


### Features

* improve container management and platform support ([dfc28a1](https://github.com/lindehoff/SpellBuddy/commit/dfc28a1c809298a102bdc7d36e8d7cad2979930c))

# [3.0.0](https://github.com/lindehoff/SpellBuddy/compare/v2.0.0...v3.0.0) (2025-03-17)


### Features

* **ci:** reorganize github workflows for better automation ([02be0c1](https://github.com/lindehoff/SpellBuddy/commit/02be0c1500d789decd2fb7d28bac0a1e832bbc13))


### BREAKING CHANGES

* **ci:** Complete restructure of CI/CD pipeline into three focused workflows:
- ci.yml: Basic CI pipeline with tests and build
- docker-build.yml: Reusable Docker workflow
- release.yml: Semantic versioning and release management

# [2.0.0](https://github.com/lindehoff/SpellBuddy/compare/v1.3.1...v2.0.0) (2025-03-17)


### Features

* **ci:** reorganize github workflows for better automation ([b7b410a](https://github.com/lindehoff/SpellBuddy/commit/b7b410a577103c25ae2927802a0201402085d70e))
* **ci:** reorganize github workflows for better automation ([44389fd](https://github.com/lindehoff/SpellBuddy/commit/44389fdbfd6a868691eb6ee23635b640b023a267))


### BREAKING CHANGES

* **ci:** Complete restructure of CI/CD pipeline into three focused workflows:
- ci.yml: Basic CI pipeline with tests and build
- docker-build.yml: Reusable Docker workflow
- release.yml: Semantic versioning and release management
* **ci:** Complete restructure of CI/CD pipeline into three focused workflows:
- ci.yml: Basic CI pipeline with tests and build
- docker-build.yml: Reusable Docker workflow
- release.yml: Semantic versioning and release management

## [1.3.1](https://github.com/lindehoff/SpellBuddy/compare/v1.3.0...v1.3.1) (2025-03-17)


### Bug Fixes

* 🐛 improve semantic-release output handling ([051d190](https://github.com/lindehoff/SpellBuddy/commit/051d19040725e0af45aeacf84bf7ef3af1b7d2bc))

# [1.3.0](https://github.com/lindehoff/SpellBuddy/compare/v1.2.0...v1.3.0) (2025-03-17)


### Features

* 🚀 ✨ enable Docker job on semantic release ([3fb2d87](https://github.com/lindehoff/SpellBuddy/commit/3fb2d87d4203199579aedbc7cd87d5ad228f2954))

# [1.2.0](https://github.com/lindehoff/SpellBuddy/compare/v1.1.2...v1.2.0) (2025-03-17)


### Features

* **admin:** ✨ Complete user admin functionality and fix various issues 🛠️ ([82963ce](https://github.com/lindehoff/SpellBuddy/commit/82963ced27f8000ff09f1407daff869949f681f6))

## [1.1.2](https://github.com/lindehoff/SpellBuddy/compare/v1.1.1...v1.1.2) (2025-03-17)


### Bug Fixes

* **hydration:** resolve React hydration mismatch issues 🔧 ([119d623](https://github.com/lindehoff/SpellBuddy/commit/119d6231c1efda30a1cd30e58aca6ed97d70fd87))

## [1.1.1](https://github.com/lindehoff/SpellBuddy/compare/v1.1.0...v1.1.1) (2025-03-17)


### Bug Fixes

* **ci:** update workflows to handle Docker image builds for releases ([ca8c437](https://github.com/lindehoff/SpellBuddy/commit/ca8c4375e35ba2388c26915f3aafeb500e2fbe81))

# [1.1.0](https://github.com/lindehoff/SpellBuddy/compare/v1.0.0...v1.1.0) (2025-03-17)


### Bug Fixes

* **release:** improve test-release script reliability ([8ff3fc1](https://github.com/lindehoff/SpellBuddy/commit/8ff3fc13e35022020e7d5ed3d1f99b0079cc69e5))
* **release:** improve test-release script reliability ([5341093](https://github.com/lindehoff/SpellBuddy/commit/5341093181897b9fdd16027dfde02db5511ac318))
* **release:** update semantic-release and commitlint config to handle release commits ([bb3a5e2](https://github.com/lindehoff/SpellBuddy/commit/bb3a5e2880b54c71b449d3353a42b99ffde44a2f))


### Features

* **admin:** 📚 Add admin implementation guides and fix release workflow ([e4b95fe](https://github.com/lindehoff/SpellBuddy/commit/e4b95fe23fa47bb58ac17c6550f32b4d98487c40))
* **admin:** 🛡️ Add admin authentication system and dashboard skeleton ([746b9ea](https://github.com/lindehoff/SpellBuddy/commit/746b9eac45821f138b149bf640e1cad9997478d5))

# 1.0.0 (2025-03-15)


### Bug Fixes

* **build:** disable ESLint and TypeScript checks during build ([257253f](https://github.com/lindehoff/SpellBuddy/commit/257253f822788e930f88dacc6d88ed7bea643a21))
* **build:** handle missing OpenAI API key during build ([20ba1f9](https://github.com/lindehoff/SpellBuddy/commit/20ba1f9c32379879f09ccc96d5579d45a8bc673d))
* **ci:** resolve GitHub authentication issue in release workflow ([460d294](https://github.com/lindehoff/SpellBuddy/commit/460d294258b8d7814853b6a787400933ec30cead))
* **ci:** resolve npm ci error in GitHub Actions workflow ([22fed97](https://github.com/lindehoff/SpellBuddy/commit/22fed9792109b53255d12e68c0996b2914866c19))
* **ci:** simplify CI/CD pipeline to avoid artifact issues ([dbc4b1e](https://github.com/lindehoff/SpellBuddy/commit/dbc4b1ecf6dda2b4af9880b982b21f41e236c485))
* **ci:** update GitHub Actions to latest versions ([e87ded5](https://github.com/lindehoff/SpellBuddy/commit/e87ded5cc65e44510da23fd6f5c9eb0edac20616))
* **db:** 🛠️ resolve database initialization errors in Docker environment ([03f79e6](https://github.com/lindehoff/SpellBuddy/commit/03f79e6381730f690cbf99b1439ebdf66340c28c))
* **db:** 🛠️ resolve database initialization in Docker environment ([8693cd5](https://github.com/lindehoff/SpellBuddy/commit/8693cd509afa999395a370f4502866d7f10ba5e0))
* docker ([5a38ea3](https://github.com/lindehoff/SpellBuddy/commit/5a38ea3e34cedc3c7124541cd0ed602f901aa518))
* **lint:** resolve linting errors ([c0af836](https://github.com/lindehoff/SpellBuddy/commit/c0af836227feb7b6256f3990d39318adac281634))
* **mobile:** 📱 enhance mobile experience and strengthen dictation prevention ([9d1f3b7](https://github.com/lindehoff/SpellBuddy/commit/9d1f3b73b19951a9b786351471c042e52b9f8365))
* **release:** 🔄 reset semantic-release process to resolve git plugin failure ([dafb9e1](https://github.com/lindehoff/SpellBuddy/commit/dafb9e1fc13a8bd73f17522657943251bac70168))
* resolve TypeScript and ESLint linting issues ([d52d2b8](https://github.com/lindehoff/SpellBuddy/commit/d52d2b8fdb937dbb3672fc7b0c117c69cd51e204))
* **ui:** update authentication pages with modern design system ([22f6e12](https://github.com/lindehoff/SpellBuddy/commit/22f6e12e055c7f3411127206f5559b7ea1ad4021))


### Features

* **achievements:** enhance achievement system with automatic seeding and release automation ([e14329f](https://github.com/lindehoff/SpellBuddy/commit/e14329f1692de933ea916fef6f15dbf5b59559a7))
* **docker:** create unified container management script ([b030a99](https://github.com/lindehoff/SpellBuddy/commit/b030a99891f454f12fc400f3502eb7297d774f15))
* **docker:** optimize container build process and reduce image size ([5e0b88d](https://github.com/lindehoff/SpellBuddy/commit/5e0b88d48e9a8b235782ef5ff0fb2d08dfc3133e))
* **mobile:** 📱 improve navbar behavior on mobile devices ([bd8bdde](https://github.com/lindehoff/SpellBuddy/commit/bd8bdde3314e05e56f64eb18523e577819de49ad))
* **ui:** improve mobile responsiveness across application ([2aed912](https://github.com/lindehoff/SpellBuddy/commit/2aed912ecd323899a1243ccc37ac0b581bce338e))
* **ui:** redesign app with modern glass morphism styling ([ae75336](https://github.com/lindehoff/SpellBuddy/commit/ae75336a2011a2058ce1b460295f98999ad953d4))

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
