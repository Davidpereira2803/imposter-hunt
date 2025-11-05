---
folder: src/components/ui
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [ui-primitives, themed-components]
consumes: [src/constants/theme]
dependencies: [react-native, expo-audio, react-native-reanimated]
children: []
notes: "Atomic UI components following theme system"
---
# Components/UI

## Purpose
Contains atomic UI primitives (Button, Card, Input, etc.) that compose the application's interface with consistent theming.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `Button.js` | file | Pressable button with variants (primary, secondary, success, danger), sound effects | stable |
| `Card.js` | file | Container card component with shadow and padding | stable |
| `CircularTimer.js` | file | Animated circular countdown timer using Reanimated | stable |
| `Input.js` | file | Text input field with themed styling | stable |
| `Pill.js` | file | Small badge/pill component for tags | stable |
| `Screen.js` | file | Safe area wrapper screen container | stable |
| `Title.js` | file | Styled heading/title text component | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->react-native (TouchableOpacity, TextInput, View, Text, etc.), src/constants/theme, expo-audio, react-native-reanimated<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->app/* screens, src/components/AdBanner, src/components/HUD<!-- gen:used-by-end -->

## Contracts & Interfaces
- All components export default React functional components
- Accept style prop for customization
- Button: `{title, onPress, variant, size, disabled, icon}`
- Input: `{value, onChangeText, placeholder, ...}`
- Timer: `{duration, onComplete}`

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Add PropTypes or TypeScript
- Extract common style logic
- Add accessibility labels
