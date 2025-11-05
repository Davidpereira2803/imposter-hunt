---
folder: src/config
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [api-config, environment-vars]
consumes: []
dependencies: [react-native-dotenv]
children: []
notes: "Configuration values and API endpoints"
---
# Config

## Purpose
Centralized configuration for API endpoints and environment-specific settings.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `api.js` | file | API configuration (likely AI topic generation endpoint) using env vars | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->react-native-dotenv (.env file)<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->src/lib/generateTopics.js<!-- gen:used-by-end -->

## Contracts & Interfaces
- Exports `API_CONFIG` object with endpoint URLs and keys
- Reads from `.env` file (not committed to repo)

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Document required environment variables
- Add validation for missing config
- Consider separate dev/prod configs
