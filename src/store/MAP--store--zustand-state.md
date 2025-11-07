---
folder: src/store
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [state-management, zustand-stores]
consumes: [src/data/topics.json]
dependencies: [zustand, AsyncStorage]
children: []
notes: "Zustand stores for game and AI state"
---
# Store

## Purpose
Defines Zustand state stores managing game state (players, rounds, topics) and AI generation state (quotas, cache).

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `gameStore.js` | file | Game state: players, topic, imposter, rounds, alive status, custom topics | stable |
| `aiStore.js` | file | AI generation state: daily quota, ad watching, topic cache, rate limiting | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->zustand (create, persist), AsyncStorage, src/data/topics.json<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->app/* screens, src/lib/generateTopics.js<!-- gen:used-by-end -->

## Contracts & Interfaces
- `gameStore.js`: Exports `useGameStore` hook with state and actions
  - State: players, topicKey, secretWord, imposterIndex, alive, round
  - Actions: setPlayers, setTopicKey, startGame, nextRound, eliminate, etc.
- `aiStore.js`: Exports `useAIStore` hook
  - State: generationsToday, watchedAdsToday, cache
  - Actions: ensureDailyReset, recordGeneration, incrementAds, etc.

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Add store unit tests with mock AsyncStorage
- Split large stores into slices
- Add TypeScript for type safety
- Document state machine/flow
