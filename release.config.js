module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    ['@semantic-release/git', {
      assets: ['package.json', 'CHANGELOG.md'],
      message: 'chore(release): ${nextRelease.version} [skip ci]\n\nRelease version ${nextRelease.version}'
    }],
    '@semantic-release/github'
  ],
  branches: [
    'main',
    { name: 'beta', prerelease: true }
  ]
} 