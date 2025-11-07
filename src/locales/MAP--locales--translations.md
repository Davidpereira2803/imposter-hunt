---
folder: src/locales
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [translations, i18n-files]
consumes: []
dependencies: []
children: []
notes: "Translation files for internationalization"
---
# Locales

## Purpose
Contains JSON translation files for multiple languages supporting internationalization (i18n).

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `en.json` | file | English translations (base language) | stable |
| `de.json` | file | German translations | stable |
| `fr.json` | file | French translations | stable |
| `pt.json` | file | Portuguese translations | stable |
| `lu.json` | file | Luxembourgish translations | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->N/A (JSON data)<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->src/lib/i18n.js<!-- gen:used-by-end -->

## Contracts & Interfaces
- Each file: JSON object with nested key-value pairs
- Keys match across all language files for consistent lookups
- Loaded by i18n-js library

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Add missing translation keys
- Validate JSON structure consistency
- Add translation management workflow
- Consider ICU message format for plurals
