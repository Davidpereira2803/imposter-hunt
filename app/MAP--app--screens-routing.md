---
folder: app
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [screens, routes, navigation]
consumes: [src/store, src/components, src/constants]
dependencies: [expo-router, react-native, expo-haptics]
children: []
notes: "Expo Router screens for game flow"
---
# App

## Purpose
Contains all Expo Router screens defining the navigation flow and game screens (setup, role assignment, voting, results, etc.).

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `_layout.js` | file | Root layout with Stack navigator, AdConsentProvider, hydration logic | stable |
| `index.js` | file | Home screen: start game, continue, settings, tutorial navigation | stable |
| `setup.js` | file | Player setup screen with name input and topic selection | stable |
| `role.js` | file | Role reveal screen (imposter vs civilian assignment) | stable |
| `round.js` | file | Round discussion timer screen | stable |
| `vote.js` | file | Voting screen for eliminating players | stable |
| `imposter-guess.js` | file | Imposter's final word guess screen | stable |
| `results.js` | file | Game results and winner announcement | stable |
| `ai-topics.js` | file | AI-powered topic generation screen | stable |
| `tutorial.js` | file | Tutorial/onboarding carousel screen | stable |
| `settings.js` | file | Settings screen for language and preferences | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->expo-router (Stack, useRouter), src/store/gameStore, src/store/aiStore, src/components/ui/*, src/constants/theme, src/constants/icons, expo-haptics, AsyncStorage<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->expo-router (automatic routing)<!-- gen:used-by-end -->

## Contracts & Interfaces
- Expo Router file-based routing convention
- Each file exports a default React component
- Uses `useGameStore` and `useAIStore` Zustand hooks
- Navigation via `useRouter().push()` and `.replace()`

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Add screen-level unit tests
- Extract repeated navigation logic
- Consider route protection/guards for game flow
