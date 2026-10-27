const fs = require('node:fs');
const builds = JSON.parse(fs.readFileSync('build-result.json', 'utf8'));
const platform = process.env.RELEASE_PLATFORM;
const matches = builds.filter((build) => build.platform.toLowerCase() === platform);
if (matches.length !== 1 || matches[0].status !== 'FINISHED') {
  throw new Error('Expected exactly one completed build for this platform');
}
const build = matches[0];
if (build.appVersion !== require('../app.json').expo.version || !build.id || !build.appBuildVersion) {
  throw new Error('Build is missing version information or has the wrong app version');
}
fs.appendFileSync(process.env.GITHUB_OUTPUT,
  `id=${build.id}\nversion=${build.appVersion}\nbuild_number=${build.appBuildVersion}\n`);
