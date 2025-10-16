# Imposter Hunt

A social deduction mobile game built with React Native and Expo where players must identify the imposter among them through discussion and voting.

## Overview

**Imposter Hunt** (also referred to as "Fakeout" in the code) is a party game for 3+ players where one player is secretly designated as the imposter. All players except the imposter receive a secret word from a chosen topic. Through discussion and subtle hints, civilian players must identify the imposter while the imposter tries to blend in and deduce the secret word.

## Game Flow

1. **Setup** - Add 3+ players and choose a topic (Food, Animals, Movies, or Countries)
2. **Role Assignment** - Each player privately views their role (Civilian or Imposter)
3. **Discussion Round** - Players discuss and give hints with a 60-second timer
4. **Voting Phase** - Players vote to eliminate a suspected imposter
5. **Results** - Game ends when the imposter is eliminated or successfully guesses the word

## Win Conditions

- **Civilians Win**: Successfully vote out the imposter
- **Imposter Wins**: 
  - Correctly guesses the secret word during discussion
  - Survives until only 2 players remain

## Features

- **Pass-and-play multiplayer** - Single device shared among all players
- **Multiple topics** with preset word lists defined in [`src/data/topics.json`](src/data/topics.json)
- **Discussion timer** with start/pause/reset controls
- **Persistent storage** - Player names and topic preferences saved using Zustand + AsyncStorage
- **Haptic feedback** for enhanced touch interactions
- **Round progression** - Multiple rounds with elimination tracking
- **Vote tallying** with tie detection and revote system

## Tech Stack

- **React Native** with Expo (~54.0)
- **Expo Router** for navigation
- **Zustand** for state management (see [`src/store/gameStore.js`](src/store/gameStore.js))
- **AsyncStorage** for data persistence
- **Expo Haptics** for tactile feedback
- **Google Mobile Ads** integration (configured but not actively used)

## Installation

```bash
# Install dependencies
npm install
```

## Building & Running

### Development Mode
```bash
# Start development server
npm start

# Or using Expo CLI directly
npx expo start
```

### Native Builds

#### Android
```bash
# Generate native Android project
npx expo prebuild

# Build and run on Android device/emulator
npx expo run:android

# Or use the npm script
npm run android
```

#### iOS
```bash
# Generate native iOS project
npx expo prebuild

# Build and run on iOS device/simulator
npx expo run:ios

# Or use the npm script
npm run ios
```

#### Web
```bash
# Run in web browser
npm run web
```

## Project Structure

```
app/
  ├── _layout.js      # Root layout with hydration handling
  ├── index.js        # Home screen
  ├── setup.js        # Player & topic selection
  ├── role.js         # Private role reveal screen
  ├── round.js        # Discussion phase with timer
  ├── vote.js         # Voting phase
  ├── results.js      # Game outcome screen
  └── settings.js     # Data management

src/
  ├── components/
  │   ├── HUD.js           # Round/player count display
  │   └── LoadingScreen.js # Hydration loading state
  ├── data/
  │   └── topics.json      # Word lists by category
  └── store/
      └── gameStore.js     # Global game state
```

## Key Components

### Game Store ([`src/store/gameStore.js`](src/store/gameStore.js))

Manages all game state including:
- Player list and alive status
- Current topic and secret word
- Imposter assignment
- Round progression
- Persistent storage via Zustand middleware

### Screens

- **[Home](app/index.js)** - Main menu with quick start options
- **[Setup](app/setup.js)** - Add players, select topic, start game
- **[Role](app/role.js)** - Pass-and-play role assignment
- **[Round](app/round.js)** - Timed discussion with imposter guess option
- **[Vote](app/vote.js)** - Sequential voting with tie detection
- **[Results](app/results.js)** - Game outcome with replay options
- **[Settings](app/settings.js)** - Data management and reset options

## Configuration

- **Package**: [`package.json`](package.json) defines `imposter-hunt` as the app name
- **App Config**: [`app.json`](app.json) includes Expo configuration, AdMob plugin setup, and native build settings
- **Topics**: Modify word lists in [`src/data/topics.json`](src/data/topics.json)

## Ad Integration

The project includes Google Mobile Ads setup:
- Test implementation in [`adApp.js`](adApp.js)
- AdMob plugin configured in [`app.json`](app.json)
- Currently using test ad unit IDs

To test ads separately, you can run the test app:
```bash
# Note: Use adApp.js as entry point for ad testing
```

## Data Persistence

Player names and topic preferences are automatically saved using:
- **Zustand persist middleware**
- **AsyncStorage** for React Native
- Storage key: `"fakeout-game-storage"`

Clear saved data via the Settings screen ([`app/settings.js`](app/settings.js)).

## Development Notes

- Uses Expo Router for file-based routing
- Implements hardware back button handling on Android
- Includes hydration timeout (3s) for AsyncStorage in [`app/_layout.js`](app/_layout.js)
- New architecture enabled in [`app.json`](app.json)
- Native folders (`/ios`, `/android`) are generated via `npx expo prebuild` and excluded from git

## Troubleshooting

### Clean Build
If you encounter build issues, try:
```bash
# Remove native folders
rm -rf android ios

# Regenerate native projects
npx expo prebuild --clean

# Rebuild
npx expo run:android
```

### Clear Cache
```bash
# Clear Metro bundler cache
npx expo start -c

# Clear npm cache
npm cache clean --force
```

## License

Private project - see [`package.json`](package.json)

---

**Minimum Players**: 3  
**Recommended Players**: 4-8  
**Platform**: iOS, Android, Web