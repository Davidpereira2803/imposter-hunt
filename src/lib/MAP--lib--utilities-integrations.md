---
folder: src/lib
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [utilities, i18n, ai-integration]
consumes: [src/store, src/config, src/locales]
dependencies: [i18n-js, expo-localization, react-native-google-mobile-ads, NetInfo]
children: []
notes: "Utility functions and service integrations"
---
# Lib

## Purpose
Contains utility functions and service integrations: internationalization, AI topic generation, and rewarded ad logic.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `i18n.js` | file | Internationalization setup with i18n-js, locale detection, translation loading | stable |
| `generateTopics.js` | file | AI-powered topic generation via API with caching and rate limiting | stable |
| `rewardedAds.js` | file | Rewarded ad loading and display logic for unlocking features | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->i18n-js, expo-localization, src/locales/*.json, src/store/aiStore, src/config/api, react-native-google-mobile-ads, NetInfo<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->app/* screens (i18n), app/ai-topics.js (generateTopics, rewardedAds)<!-- gen:used-by-end -->

## Contracts & Interfaces
- `i18n.js`: Exports configured i18n instance with `t()` function
- `generateTopics.js`: Async function returning generated topics
- `rewardedAds.js`: Functions for loading/showing rewarded ads

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Add offline fallback for AI generation
- Mock API for testing
- Add error tracking for ad failures
