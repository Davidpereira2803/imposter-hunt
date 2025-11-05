---
folder: .
owner: Davidpereira2803
status: stable
last_updated: 2025-11-06
provides: [expo-router-app, game-entry, android-build]
consumes: []
dependencies: [expo, react-native, zustand, expo-router]
children: [app, src, assets, android]
notes: "Root of Imposter Hunt - React Native/Expo social deduction game"
---
# Root

## Purpose
Main repository root for **Imposter Hunt**, a social deduction game built with React Native and Expo where players identify the imposter on a shared device.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `App.js` | file | Re-exports expo-router entry point | stable |
| `app.json` | file | Expo app configuration (name, version, assets) | stable |
| `package.json` | file | Dependencies: expo, react-native, zustand, expo-router, google-mobile-ads | stable |
| `babel.config.js` | file | Babel preset configuration for Expo | stable |
| `eas.json` | file | Expo Application Services build configuration | stable |
| `adApp.js` | file | Ad integration app variant | stable |
| `orApp.js` | file | Original app variant | stable |
| `System.md` | file | System documentation | stable |
| `README.md` | file | Repository readme and overview | stable |
| `Privacy.md` | file | Privacy policy documentation | stable |
| `404.md` | file | 404 page content | stable |
| `index.md` | file | Index page content | stable |
| `_config.yml` | file | Jekyll site configuration | stable |
| `Gemfile` | file | Ruby gems for Jekyll | stable |
| `app/` | folder | Expo Router screens (setup, role, vote, results, etc.) | stable |
| `src/` | folder | Source code: components, stores, lib, locales, data | stable |
| `assets/` | folder | Images, icons, sounds, store graphics | stable |
| `android/` | folder | Android native build configuration | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->expo-router, react, react-native, zustand, expo-* packages, @react-native-async-storage/async-storage, react-native-google-mobile-ads<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->N/A (root)<!-- gen:used-by-end -->

## Contracts & Interfaces
- Expo Router v6 file-based routing
- React Native 0.81.5
- Zustand state management
- Google Mobile Ads integration

## Tests & Coverage
No test files detected at root level.

## TODO / Next Steps
- Consider adding test infrastructure (Jest, React Native Testing Library)
- Document environment variable setup (.env)
- Add CI/CD workflow files
