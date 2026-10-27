// Generate CI-only submission settings without committing account credentials.
const fs = require('node:fs');
const required = (name) => {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
  return process.env[name];
};
const platform = required('RELEASE_PLATFORM');
const destination = required('RELEASE_DESTINATION');
if (!['android', 'ios'].includes(platform) || !['testing', 'production'].includes(destination)) {
  throw new Error('Invalid release platform or destination');
}
const app = require('../app.json').expo;
const pkg = require('../package.json');
const ref = required('RELEASE_REF');
if (!/^v\d+\.\d+\.\d+$/.test(ref) || ref !== `v${app.version}` || pkg.version !== app.version) {
  throw new Error('Release requires a vX.Y.Z tag matching app.json and package.json');
}
required('EXPO_TOKEN');
const config = require('../eas.json');
const credentialsDir = required('RUNNER_TEMP');
if (platform === 'android') {
  const path = `${credentialsDir}/play-service-account.json`;
  const key = required('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
  JSON.parse(key);
  fs.writeFileSync(path, key, { mode: 0o600 });
  config.submit.ci = { android: {
    serviceAccountKeyPath: path,
    track: destination === 'production' ? 'production' : 'internal',
    releaseStatus: 'completed',
    changesNotSentForReview: false,
  }};
} else {
  if (destination === 'production' && !required('RELEASE_NOTES').trim()) {
    throw new Error('IOS_RELEASE_NOTES must not be blank');
  }
  const path = `${credentialsDir}/app-store-connect.p8`;
  fs.writeFileSync(path, required('ASC_API_KEY_P8'), { mode: 0o600 });
  config.submit.ci = { ios: {
    ascAppId: required('ASC_APP_ID'),
    ascApiKeyPath: path,
    ascApiKeyId: required('ASC_KEY_ID'),
    ascApiKeyIssuerId: required('ASC_ISSUER_ID'),
    appleTeamId: required('APPLE_TEAM_ID'),
  }};
}
fs.writeFileSync('eas.json', `${JSON.stringify(config, null, 2)}\n`);
