---
folder: assets
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [images, icons, sounds, store-assets]
consumes: []
dependencies: []
children: [android, expo, ios, sounds, sounds-drafts, store]
notes: "Static assets: images, icons, audio files, store graphics"
---
# Assets

## Purpose
Contains all static assets including app icons, splash screens, sound effects, and store listing graphics.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `icon.png` | file | App icon (primary) | stable |
| `icon2.png` | file | App icon variant | stable |
| `splash.png` | file | Splash screen image | stable |
| `splash-icon.png` | file | Splash screen icon | stable |
| `adaptive-icon.png` | file | Android adaptive icon | stable |
| `favicon.png` | file | Web favicon | stable |
| `Feature Graphic.png` | file | Google Play feature graphic | stable |
| `Master1024_dark.png` | file | Master asset dark variant (1024x1024) | stable |
| `Master1024_transparent.png` | file | Master asset transparent variant | stable |
| `android/` | folder | Android-specific assets | stable |
| `expo/` | folder | Expo-specific assets | stable |
| `ios/` | folder | iOS-specific assets | stable |
| `sounds/` | folder | Game sound effects (button clicks, win/lose, timer) | stable |
| `sounds-drafts/` | folder | Draft/unused sound files | wip |
| `store/` | folder | App store and Play Store listing graphics | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->N/A (static files)<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->app.json (icon, splash), src/components/ui/Button.js (sounds), app/* screens<!-- gen:used-by-end -->

## Contracts & Interfaces
- PNG images for icons and graphics
- MP3/WAV files for audio
- Expo asset system for bundling

## Tests & Coverage
N/A (static assets)

## TODO / Next Steps
- Optimize image sizes
- Clean up sounds-drafts folder
- Add asset documentation
