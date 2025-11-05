---
folder: src/data
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [static-data, game-content]
consumes: []
dependencies: []
children: []
notes: "Static JSON data and content definitions"
---
# Data

## Purpose
Contains static game content: predefined topics, word lists, and tutorial step definitions.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `topics.json` | file | Predefined game topics with words (likely: animals, food, countries, etc.) | stable |
| `luWords.json` | file | Luxembourgish word list/dictionary | stable |
| `tutorialSteps.js` | file | Tutorial step definitions with text and illustrations | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->N/A (static data)<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->src/store/gameStore.js (topics), app/tutorial.js (tutorialSteps)<!-- gen:used-by-end -->

## Contracts & Interfaces
- `topics.json`: Array/object of topic categories with word arrays
- `tutorialSteps.js`: Exports array of step objects with text/images
- `luWords.json`: JSON dictionary/word list

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Validate JSON schema
- Add more topic categories
- Extract tutorial text to localization files
