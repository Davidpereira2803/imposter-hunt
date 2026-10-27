# App CI and releases

GitHub Actions runs the checks and triggers EAS cloud builds for both stores. No local Xcode or Android build machine is needed for routine releases. Apple and Google still control processing, review, and publishing eligibility.

## What is included

- `ci.yml`: runs Jest, validates Expo config, and exports both mobile bundles on PRs and pushes to `master`.
- `release.yml`: repeats checks before releasing. A `vX.Y.Z` tag automatically uploads production-signed builds to Play internal testing and TestFlight. A manual run on a version tag can target testing or production and either or both platforms.
- Production Android submissions target the public production track. Production iOS submissions wait for build processing, select the exact version/build, submit for review with Fastlane, and request automatic release with Apple's phased rollout.
- Builds use the EAS `production` environment, even when uploaded to testing, so testers exercise production configuration.
- EAS manages build numbers remotely; the visible app version is managed in Git.
- Releases are serialized; the two platforms run independently, so one store's failure does not cancel the other.

## Guided GitHub configuration

On your own terminal, install [GitHub CLI](https://cli.github.com), then run:

```sh
gh auth login
bash scripts/setup-ci.sh
```

The script creates missing GitHub environments, prompts for secret values or credential file paths, and saves settings directly to GitHub. Existing environment protections are preserved. Use an account with repository administration permissions. No credentials should be pasted into chat or committed to Git.

Alternatively, enter the same settings in the GitHub web interface using the tables below.

After pushing these workflows to `master`, run **Actions → Release readiness → Run workflow**, selecting `testing`. This checks settings, key formats, and Expo project access without building or submitting. It does not verify store API permissions or signing; the first testing release does that.

## One-time account setup

1. In Expo, confirm you have access to project `7e326574-2b4c-434f-8845-e9d61544fa7c` under `davidpereira2803`.
2. Confirm production builds work non-interactively on both platforms. Inspect existing credentials with `eas credentials`. Preserve the Android upload key and existing bundle/package identifiers. If the remote build counters are not already correct, initialize them with `eas build:version:set` to at least the latest uploaded store build numbers. Do not reset counters during routine releases.
3. Create an Expo access token. Keep signing certificates/provisioning profiles and the Android keystore in EAS. Expired/revoked Apple signing credentials may require repair before CI can build again.
4. Create an App Store Connect **team API key** with App Manager permissions and access to this app; download its `.p8` once. Find the numeric Apple app ID in App Store Connect and the Apple Developer team ID. Existing store metadata, screenshots, privacy declarations, age ratings, review contact and any required review access must be complete. New agreements or changed policy requirements can still require account-owner action.
5. Create a Google service account key, enable the Android Publisher API for its cloud project, and grant that service account access to this app in Play Console, including testing and production release permissions. The app is already published, so the initial manual-upload requirement should already be satisfied.
6. In GitHub Settings → Environments, create `testing` and `production`. Restrict deployment tags to `v*`. Restrict tag creation with repository rulesets to trusted release maintainers. `testing` needs no reviewer. You can optionally require a reviewer for production; without that setting, a manual production run proceeds automatically.
7. In GitHub branch protection/rulesets for `master`, require the `App checks / checks` job before merging. Confirm the exact check name after the first workflow run.

### GitHub environment secrets

Configure these in both environments (or as repository secrets shared by both):

| Secret | Value |
| --- | --- |
| `EXPO_TOKEN` | Expo access token |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Entire service-account JSON file, as raw multiline JSON |
| `ASC_API_KEY_P8` | Entire raw multiline `.p8` file, including PEM header/footer; not base64 |
| `ASC_KEY_ID` | App Store Connect API key ID |
| `ASC_ISSUER_ID` | App Store Connect API issuer ID |

### GitHub environment variables

| Variable | Value |
| --- | --- |
| `ASC_APP_ID` | Numeric Apple app ID (not the bundle identifier) |
| `APPLE_TEAM_ID` | Apple Developer team ID |
| `IOS_RELEASE_NOTES` | What's New text for the current production release; required for iOS production |

Never commit credential files. The workflow writes submission credentials to runner temporary files, deletes them afterwards, and does not upload them as artifacts. The generated `ci` submission profile exists only on the runner. The committed `production` submission profile remains available for existing local workflows.

### EAS production environment

Configure these in the Expo dashboard's **production** environment, as used by the Babel `@env` imports:

- `API_BASE_URL`
- `API_KEY`
- `AD_BANNER_UNIT_ID`
- `AD_REWARDED_UNIT_ID`
- `AD_BANNER_UNIT_ID_IOS`
- `AD_REWARDED_UNIT_ID_IOS`

These values are compiled into the mobile app; storing them as CI/EAS secrets does not make them private from app users. A privileged backend/provider key must remain on the backend. Confirm the API key is appropriate for distribution in a client app.

Before the first release, review `app.json`: the iOS AdMob application ID currently uses Google's sample ID (`ca-app-pub-3940256099942544~1458002511`). Supply your actual iOS AdMob app ID if production ads are intended. This is separate from the ad unit IDs above.

## Monthly release

1. Merge changes after CI passes. Update `expo.version` in `app.json`, `version` in `package.json`, and the lockfile root version together. For example, use `npm version 1.1.1 --no-git-tag-version`, then update `app.json` to `1.1.1`. Commit the version changes.
2. Create and push a matching tag:

   ```sh
   git tag v1.1.1
   git push origin v1.1.1
   ```

3. The tag workflow builds both platforms and uploads to TestFlight and Play internal testing. Ensure internal tester groups/distribution are configured in each store. Test gameplay, ads/consent, audio, translations, and AI topic generation on real devices.
4. Set production `IOS_RELEASE_NOTES`. In GitHub Actions → Release app → Run workflow, select the **same version tag** in the ref selector, `production`, and the desired platform(s).
5. This first implementation makes fresh production builds with higher build numbers; it does not promote the previously tested binary. The source tag and EAS environment are the same, but verify the final builds if needed. Exact tested-binary promotion can be added later.
6. Follow the workflow logs and store dashboards. GitHub success means submission was accepted, not that review has completed or the version is public. Apple's phased release runs after approval; Google production is configured for a completed release, subject to review and managed publishing settings.

Selecting a branch for a manual run skips the release job: use a `vX.Y.Z` tag. Version tags must match both manifest versions. Never move a released tag.

## Failure recovery and ongoing maintenance

- If one platform fails, run the workflow again for only that platform. A rerun creates another build number; it does not pick an arbitrary latest build.
- If upload succeeded but review submission failed, inspect App Store Connect before retrying. An already pending or published version may require a new app version, and rerunning the whole workflow is not a rollback.
- To fix a public binary, release a higher app version. There is no configured OTA rollback or EAS Update support yet.
- Native EAS build and Fastlane versions are explicitly selected in the workflow; update them deliberately. The npm dependency graph uses `npm ci`. Fastlane's version is pinned, but its transitive Ruby dependencies are not locked yet.
- Watch EAS usage/build quotas and GitHub runner usage. Builds wait in CI so build failures fail the workflow.
- Review changing store SDK/target-API requirements and renew signing credentials as needed.

## References

- [EAS builds from CI](https://docs.expo.dev/build/building-on-ci/)
- [EAS submission configuration](https://docs.expo.dev/eas/json/)
- [EAS submission behavior](https://docs.expo.dev/build/automate-submissions/)
- [Fastlane App Store submission](https://docs.fastlane.tools/actions/deliver/)
