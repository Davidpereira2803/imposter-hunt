---
folder: src/constants
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [theme, icons, design-tokens]
consumes: []
dependencies: [react-native-svg]
children: []
notes: "Design system constants and icon definitions"
---
# Constants

## Purpose
Defines the design system (colors, spacing, typography) and icon library used throughout the application.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `theme.js` | file | Design tokens: palette, space, radii, type (font sizes/weights) | stable |
| `icons.js` | file | SVG icon components and icon registry | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->react-native-svg (Svg, Path, etc.)<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->src/components/ui/*, app/* screens<!-- gen:used-by-end -->

## Contracts & Interfaces
- `theme.js` exports: `palette`, `space`, `radii`, `type`
- `icons.js` exports: `Icon` component and `icons` object mapping names to components

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Document color usage guidelines
- Add dark mode support
- Create visual style guide
