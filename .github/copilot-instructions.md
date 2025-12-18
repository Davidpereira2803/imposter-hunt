# Copilot Instructions for Imposter Hunt

These instructions guide AI coding agents working in this Expo/React Native codebase to be productive quickly.

## Architecture & Key Modules
- **App framework**: Expo SDK 54 + React Native; routing via Expo Router. Entry: `expo-router/entry`.
- **Screens**: File-based under `app/` (e.g., `app/index.js`, `app/setup.js`, `app/round.js`, `app/vote.js`, `app/ai-topics.js`).
- **Global layout**: `app/_layout.js` wraps all routes; sets providers (`SafeAreaProvider`, `AdConsentProvider`), status bar, initial route, and bootstraps store hydration.
- **State management**: Zustand stores in `src/store/`:
  - `gameStore.js`: players, roles (imposter/jester/sheriff), rounds, elimination, topic selection.
  - `aiStore.js`: AI generation counters (daily free + rewarded), cached results, history of generated topics.
  - `languageStore.js`: locale selection; i18n uses JSON files in `src/locales/`.
- **UI components**: Shared primitives under `src/components/ui/` (Button, Card, Input, etc.) + feature components (AdBanner, AITutorialModal).

## AI Topic Generation Flow
- **Config**: `src/config/api.js` exports `API_CONFIG` sourced from `@env` (`API_BASE_URL`, `API_KEY`).
- **Generator**: `src/lib/generateTopics.js`:
  - Endpoint `${API_CONFIG.BASE_URL}/api/complete`.
  - POST `{ prompt, count, difficulty }` with `Authorization: Bearer ${API_CONFIG.API_KEY}`.
  - Caches results via `useAIStore` and returns local fallback if offline or error.
- **Screen**: `app/ai-topics.js` uses `generateTopics()`, `useAIStore` counters, tooltips, and tutorial modal (`src/components/AITutorialModal.js`).

## Ads & Privacy
- **Ad units**: `src/config/adshelper.js` reads `AD_BANNER_UNIT_ID`/`AD_REWARDED_UNIT_ID` from `@env`.
- **Banner**: `src/components/AdBanner.js` uses `react-native-google-mobile-ads`; respect consent via `AdConsentContext` (`src/contexts/AdConsentContext.js`).
- **Settings**: Privacy policy link in `app/settings.js`; consent toggles reflected by AdMob request options.

## Environment Variables
- **Source**: Babel plugin `module:react-native-dotenv` defined in `babel.config.js` provides `@env` imports.
- **Usage**: `src/config/api.js`, `src/config/adshelper.js` import from `@env`. On EAS builds, define secrets in EAS; local `.env` optional.

## Testing & Conventions
- **Tests**: Jest + `jest-expo`. Suites under `__tests__/`:
  - `gameStore.test.js`: store lifecycle (startMatch, roles, elimination).
  - `aiStore.test.js`: daily counters, cache freshness, history cap.
  - `testHelpers.test.js`: input cleaning and helpers.
- **Run**: `npm test` or `jest --watch`. Mocks configured in `jest.setup.js`.
- **Input normalization**: For imposter guess comparison, normalize case, Unicode diacritics, punctuation, and whitespace (see `app/imposter-guess.js`).
- **Navigation params**: Ensure param names match across screens (e.g., pass `winner` from `app/imposter-guess.js` and read in `app/results.js`).

## Build & Dev Workflow
- **Start**: `npm start` (or `expo start`).
- **Android/iOS**: `eas build -p android|ios` with profiles in `eas.json`.
- **Dependency sync**: Use `npx expo-doctor` and `npx expo install --check`; align React to peer requirements (e.g., `expo-router` requires React 19.2.x).

## Patterns & Tips
- **Topics**: Built-in locale keys under `src/locales/*.json`; custom/AI topics show original names via store getters.
- **Caching**: `aiStore` caches generation results keyed by a hash of description + settings; stale entries cleaned after ~7 days.
- **Safe areas**: Use `SafeAreaView` or wrap Stack with `SafeAreaView edges={["bottom"]}` in `_layout.js` to avoid overlapping Android navigation bar.
- **Docs site**: Jekyll Pages under `docs/` with `baseurl: /imposter-hunt` set in `_config.yml`.

## Examples
- Add a new screen: create `app/my-screen.js`; it auto-registers via file routing and inherits providers from `_layout.js`.
- Use AI generator: call `generateTopics({ description, numTopics, difficulty, language })` and handle `{ success, data, warning }`.
- Update ad units: set EAS secrets, then reference in `src/config/adshelper.js` through `@env`.

If any section is unclear or missing (e.g., additional stores, ad consent details, or build profiles), tell us and we’ll refine these instructions. 