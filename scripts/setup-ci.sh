#!/usr/bin/env bash
# Run locally after `gh auth login`; credential values go directly to GitHub.
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo 'Install GitHub CLI from https://cli.github.com, then run gh auth login.' >&2
  exit 1
fi
gh auth status >/dev/null
repo='Davidpereira2803/imposter-hunt'

# Create environments without overwriting any existing protection settings.
for environment in testing production; do
  if ! gh api "repos/$repo/environments/$environment" --silent; then
    gh api --method PUT "repos/$repo/environments/$environment" --silent
  fi
done

set_secret() {
  local name="$1"
  local description="$2"
  echo
  echo "$name — $description"
  echo 'Press Enter to configure, or type skip to keep an existing value.'
  local choice
  read -r choice
  if [[ "$choice" != skip ]]; then
    # gh prompts for secret values without echoing them to the terminal.
    gh secret set "$name" --repo "$repo"
  fi
}

set_secret EXPO_TOKEN 'Expo access token'
set_secret ASC_KEY_ID 'App Store Connect API key ID'
set_secret ASC_ISSUER_ID 'App Store Connect API issuer ID'

set_file_secret() {
  local name="$1"
  local description="$2"
  local credential_path
  echo
  echo "$name — $description"
  echo 'Enter the local file path, or type skip to keep an existing value:'
  read -r credential_path
  if [[ "$credential_path" != skip ]]; then
    if [[ ! -f "$credential_path" ]]; then
      echo "File not found: $credential_path" >&2
      exit 1
    fi
    gh secret set "$name" --repo "$repo" < "$credential_path"
  fi
}

set_file_secret ASC_API_KEY_P8 'raw Apple .p8 file'
set_file_secret GOOGLE_PLAY_SERVICE_ACCOUNT_JSON 'Google service-account JSON file'

read -r -p 'Numeric App Store Connect app ID: ' asc_app_id
read -r -p 'Apple Developer team ID: ' apple_team_id
[[ "$asc_app_id" =~ ^[0-9]+$ ]] || { echo 'Apple app ID must be numeric.' >&2; exit 1; }
[[ -n "$apple_team_id" ]] || { echo 'Apple team ID is required.' >&2; exit 1; }
for environment in testing production; do
  gh variable set ASC_APP_ID --repo "$repo" --env "$environment" --body "$asc_app_id"
  gh variable set APPLE_TEAM_ID --repo "$repo" --env "$environment" --body "$apple_team_id"
done

echo
echo 'GitHub account configuration saved. No release has been started.'
echo 'Next: configure EAS production variables and verify existing signing credentials.'
echo "Review environments: https://github.com/$repo/settings/environments"
echo 'Set IOS_RELEASE_NOTES in the production environment before an iOS production release.'
echo 'See docs/CI-CD.md for EAS variables, store permissions, and the first test run.'
