---
layout: default
title: How to Play
---

#### (v1.0.2) What is new?
* Add civilian elimination modal
* Correct and complete the languages locale, to be complete
* Restrucutre the main homepage

#### (v1.0.3) What is new?
* Add view role feature during the round (based on my own feedback)
* Redesigned the structure of the AI Topics Generator Screen (based on reddit feedback)
* Improved the text inside buttons, depending on the language
* Improve homescreen (Add more information about the game)

#### (v1.0.4) What is new?
* Restructure home screen -> add quick access to topic generator
* Clarify minimum number of players (based on reddit feedback)
* Add Italian & Spanish as languages
* **NEW: Special Roles System** - Added Jester and Sheriff roles (requires 4+ players)
* **NEW: Jester Role** - Win by getting voted out! Act suspicious and trick others into eliminating you
* **NEW: Sheriff Role** - Inspect one player's role during the round to help civilians find the imposter
* Redesigned role reveal screen with distinct colors and icons for all roles
* Improved round screen with discrete timer controls (icon-only buttons inside timer)
* Enhanced voting system to handle Jester win condition
* Added role-specific missions and objectives for better gameplay clarity
* Improved UI consistency across all game screens

#### (v1.0.5) What is new?
* BUG: Fix homescreen topic information bar
* BUG: Fix imposter guess
* Update Tutorial (to do)

# How to Play Imposter Hunt

**Imposter Hunt** is a fast-paced social deduction game where players try to uncover who among them is the imposter — all on a single shared device.

## About the Game

Gather your friends and take turns passing the phone around. Everyone except one player receives a secret word from a chosen topic — but the **Imposter** has no clue!
Your goal: give hints, discuss, and vote out the impostor before they can figure out the word.

### How to Play

1. **Setup** – Add 3+ players and pick a topic (Food, Animals, Movies, Countries, or create custom topics).
   * **Optional**: Enable special roles (Jester & Sheriff) with 4+ players for added strategy!
2. **Role Reveal** – Each player privately views their role (Civilian, Imposter, Jester, or Sheriff).
3. **Discussion** – Give subtle hints and try to expose the Imposter.
   * **Sheriff Ability**: The Sheriff can inspect one player's role once per game!
4. **Voting** – Decide who to vote out each round.
5. **Imposter Guess** – The Imposter has one chance to guess the secret word.
6. **Results** – Either the Imposter wins by guessing correctly, Civilians win by catching them, or the Jester wins by getting eliminated!

### Win Conditions

* **Civilians Win**: 
  * The imposter is correctly voted out.
  * The imposter guesses the secret word incorrectly.
* **Imposter Wins**:
  * Correctly guesses the secret word.
  * Survives until only 2 players remain.
* **Jester Wins** *(NEW)*:
  * Gets voted out during any voting round (wins alone!).
* **Sheriff** *(NEW)*:
  * Part of the Civilian team with a special ability to inspect one player's role.

---

## Features

* **Pass-and-play multiplayer** — one device for all players.
* **Special roles system** *(NEW)* — Jester and Sheriff add strategic depth (4+ players required).
* **Role inspection ability** *(NEW)* — Sheriff can reveal one player's true role.
* **AI-powered topic generation** — create custom topic lists with AI assistance.
* **Multiple game modes** — play with built-in topics or your own custom lists.
* **Clean minimal UI** optimized for quick social play.
* **Haptic feedback** for tactile interactions.
* **Round timer** with discrete controls (icon-only buttons inside timer circle).
* **Persistent storage** for player names, custom topics, and settings.
* **Multi-round gameplay** with elimination tracking.
* **Smart voting system** that handles ties, revotes, and Jester wins.
* **Rewarded ads** for additional AI generations.
* **Privacy-first ad consent** using Google UMP SDK.
* **Tutorial mode** for first-time players.

---

## Built With

* **React Native** & **Expo (SDK 54)**
* **Expo Router** – File-based routing system.
* **Zustand** – Lightweight state management with persistence.
* **AsyncStorage** – Persistent data storage.
* **Expo Haptics** – Touch feedback.
* **Google Mobile Ads (AdMob)** – Banner and rewarded ads with UMP consent.
* **Custom AI API** – For generating topic lists.

---

## Project Structure

```
app/
  ├── index.js              # Main menu
  ├── setup.js              # Player & topic selection (with special roles toggle)
  ├── role.js               # Role reveal screen (supports 4 roles)
  ├── round.js              # Discussion phase (with Sheriff inspection)
  ├── vote.js               # Voting phase (handles Jester wins)
  ├── imposter-guess.js     # Imposter's final guess
  ├── results.js            # Game result screen (all win conditions)
  ├── settings.js           # App settings & preferences
  ├── ai-topics.js          # AI topic generation
  ├── custom-topics.js      # Custom topic management
  ├── tutorial.js           # First-time tutorial
  └── _layout.js            # Root layout with consent provider
src/
  ├── components/
  │   ├── ui/               # Reusable UI components
  │   │   ├── Screen.js
  │   │   ├── Button.js
  │   │   ├── Input.js
  │   │   ├── Card.js
  │   │   ├── Pill.js
  │   │   ├── CircularTimer.js  # (Updated with built-in controls)
  │   │   └── Title.js
  │   ├── AdBanner.js       # Banner ad component
  │   └── LoadingScreen.js
  ├── contexts/
  │   └── AdConsentContext.js  # UMP consent management
  ├── store/
  │   ├── gameStore.js      # Game state (now includes special roles)
  │   └── aiStore.js        # AI generation tracking
  ├── lib/
  │   ├── generateTopics.js # AI topic generation API
  │   └── rewardedAds.js    # Rewarded ad handling
  ├── config/
  │   └── api.js            # API configuration
  ├── data/
  │   └── topics.json       # Built-in topic lists
  ├── locales/              # Translations
  │   └── en.json           # (Updated with special role strings)
  └── constants/
      ├── theme.js          # Design tokens
      └── icons.js          # Icon mappings
```

---

## State Management

### Game Store (Zustand)

Manages core game state with AsyncStorage persistence:
* Player list and elimination status
* Current imposter and secret word
* **Role assignments** *(NEW)* — Tracks Civilian, Imposter, Jester, and Sheriff roles
* **Special role states** *(NEW)* — Jester/Sheriff enabled flags, Sheriff ability usage
* Round tracking and voting history
* Custom topic management

### AI Store

Tracks AI generation usage:
* Free generation count (1 per day)
* Rewarded ad views (up to 5 per day)
* Generated topic history

### Ad Consent Context

Handles Google UMP SDK consent flow:
* Auto-prompts on first launch (when required)
* Manages personalized vs non-personalized ads
* Privacy options accessible from settings

---

### Ad Types

* **Banner Ads** – Non-intrusive bottom banners on main screens
* **Rewarded Ads** – Optional ads for additional AI generations

### Privacy Compliance

* Uses Google UMP SDK for GDPR/CCPA compliance
* Consent form shown on first launch when required
* Users can manage privacy settings anytime
* Non-personalized ads by default

---

## AI Topic Generation

The app includes an AI-powered feature to generate custom topic lists:

1. **Free Generation** – 1 free generation per day
2. **Rewarded Generations** – Watch up to 5 ads per day for more
3. **Customization** – Specify topic count, difficulty, and description
4. **Persistence** – Generated topics saved locally for reuse

API integration handled via `src/lib/generateTopics.js` with credentials from environment variables.

---

## Privacy & Data

### Local Storage Only

* All game data stored locally via AsyncStorage
* Player names, custom topics, and settings never leave device
* No cloud sync or external data collection

### Ad Tracking

* Uses Google Mobile Ads SDK with UMP consent
* Advertising ID permission declared for Android 13+
* Users control ad personalization via settings

See the [Privacy Policy](PRIVACY.md) for complete details.

---

## Contributing

This is a personal project, but feedback and suggestions are welcome. Please open an issue for bugs or feature requests.

---

## License

Copyright 2025 David Pereira — All rights reserved.

This software and associated documentation files may not be copied, modified, merged, published, distributed, sublicensed, or sold without express written permission from the author.

---

## Acknowledgments

Built with Expo, React Native, and the React Native community ecosystem.
