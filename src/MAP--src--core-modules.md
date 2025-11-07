---
folder: src
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [components, stores, utilities, localization]
consumes: []
dependencies: [zustand, i18n-js, expo-localization, AsyncStorage]
children: [components, config, constants, contexts, data, lib, locales, store]
notes: "Core source code organized by functional domain"
---
# Src

## Purpose
Contains all reusable source code: UI components, state stores, utility libraries, localization files, and static data.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `components/` | folder | Reusable React components (AdBanner, HUD, LoadingScreen, ui/*) | stable |
| `config/` | folder | Configuration files (API endpoints) | stable |
| `constants/` | folder | Theme and icon constants | stable |
| `contexts/` | folder | React contexts (AdConsentContext) | stable |
| `data/` | folder | Static JSON data (topics, words, tutorial steps) | stable |
| `lib/` | folder | Utility functions (i18n, generateTopics, rewardedAds) | stable |
| `locales/` | folder | Translation files (en, de, fr, pt, lu) | stable |
| `store/` | folder | Zustand state stores (gameStore, aiStore) | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->zustand, react-native, expo-*, AsyncStorage, i18n-js<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->app/* screens, root App.js<!-- gen:used-by-end -->

## Contracts & Interfaces
- Exports components, hooks, utilities for consumption by app screens
- Zustand stores: `useGameStore`, `useAIStore`
- i18n instance exported from `lib/i18n.js`

## Tests & Coverage
No test files present in src/.

## TODO / Next Steps
- Add unit tests for stores and utilities
- Consider splitting large stores
- Document public API surface
