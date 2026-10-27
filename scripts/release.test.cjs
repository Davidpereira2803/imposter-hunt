const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'munkeler-release-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'scripts'));
  for (const file of ['release-config.cjs', 'release-build.cjs']) {
    fs.copyFileSync(path.join(__dirname, file), path.join(dir, 'scripts', file));
  }
  for (const file of ['app.json', 'package.json', 'eas.json']) {
    fs.copyFileSync(path.join(__dirname, '..', file), path.join(dir, file));
  }
  const version = require('../app.json').expo.version;
  const env = {
    ...process.env, RUNNER_TEMP: dir, GITHUB_OUTPUT: path.join(dir, 'outputs'),
    RELEASE_PLATFORM: 'android', RELEASE_DESTINATION: 'testing', RELEASE_REF: `v${version}`,
    EXPO_TOKEN: 'test-token', GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '{}',
    ASC_API_KEY_P8: 'test-key', ASC_APP_ID: '123', ASC_KEY_ID: 'key',
    ASC_ISSUER_ID: 'issuer', APPLE_TEAM_ID: 'team', RELEASE_NOTES: 'Bug fixes',
  };
  const run = (script) => spawnSync(process.execPath, [`scripts/${script}.cjs`], { cwd: dir, env, encoding: 'utf8' });
  return { dir, env, run, version };
}

test('submission settings select testing or production explicitly', (t) => {
  const { dir, env, run } = fixture(t);
  assert.equal(run('release-config').status, 0);
  let config = JSON.parse(fs.readFileSync(path.join(dir, 'eas.json')));
  assert.equal(config.submit.ci.android.track, 'internal');
  assert.equal(fs.statSync(path.join(dir, 'play-service-account.json')).mode & 0o777, 0o600);
  env.RELEASE_DESTINATION = 'production';
  assert.equal(run('release-config').status, 0);
  config = JSON.parse(fs.readFileSync(path.join(dir, 'eas.json')));
  assert.equal(config.submit.ci.android.track, 'production');
  assert.equal(config.submit.ci.android.releaseStatus, 'completed');
});

test('invalid tag or missing credentials fail before building', (t) => {
  const { env, run, version } = fixture(t);
  env.RELEASE_REF = 'master';
  assert.notEqual(run('release-config').status, 0);
  env.RELEASE_REF = 'v999.0.0';
  assert.notEqual(run('release-config').status, 0);
  env.RELEASE_REF = `v${version}`;
  env.EXPO_TOKEN = '';
  assert.notEqual(run('release-config').status, 0);
});

test('iOS requires release notes for production and all account settings', (t) => {
  const { env, run, dir } = fixture(t);
  env.RELEASE_PLATFORM = 'ios';
  env.RELEASE_DESTINATION = 'production';
  env.RELEASE_NOTES = '';
  assert.notEqual(run('release-config').status, 0);
  env.RELEASE_NOTES = 'Fixes';
  env.ASC_APP_ID = '';
  assert.notEqual(run('release-config').status, 0);
  env.ASC_APP_ID = '123';
  assert.equal(run('release-config').status, 0);
  const config = JSON.parse(fs.readFileSync(path.join(dir, 'eas.json')));
  assert.equal(config.submit.ci.ios.ascAppId, '123');
});

test('only the completed build of the requested platform/version is submitted', (t) => {
  const { dir, run, version } = fixture(t);
  const build = { id: 'exact-build-id', platform: 'ANDROID', status: 'FINISHED', appVersion: version, appBuildVersion: '42' };
  const write = (builds) => fs.writeFileSync(path.join(dir, 'build-result.json'), JSON.stringify(builds));
  write([build]);
  assert.equal(run('release-build').status, 0);
  assert.match(fs.readFileSync(path.join(dir, 'outputs'), 'utf8'), /id=exact-build-id/);
  for (const builds of [[], [build, build], [{ ...build, status: 'ERRORED' }], [{ ...build, platform: 'IOS' }], [{ ...build, appVersion: '999.0.0' }]]) {
    write(builds);
    assert.notEqual(run('release-build').status, 0);
  }
});
