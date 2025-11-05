---
folder: src/components
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [react-components, ui-components, ads]
consumes: [src/constants, src/contexts]
dependencies: [react-native, expo-audio, react-native-google-mobile-ads]
children: [ui]
notes: "Top-level reusable React components"
---
# Components

## Purpose
Provides shared React components used across the application, including ad integration, HUD, and loading screens.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `AdBanner.js` | file | Google Mobile Ads banner component with consent handling | stable |
| `HUD.js` | file | Heads-up display overlay component | stable |
| `LoadingScreen.js` | file | Full-screen loading indicator | stable |
| `ui/` | folder | Reusable UI primitives (Button, Card, Input, Screen, etc.) | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->react-native-google-mobile-ads, src/contexts/AdConsentContext, src/constants/theme, react-native<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->app/* screens, app/_layout.js<!-- gen:used-by-end -->

## Contracts & Interfaces
- Each component exports a default React functional component
- Ad components integrate with AdConsentContext
- UI components follow theme constants

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Add component prop documentation
- Create Storybook or component catalog
- Add snapshot tests
