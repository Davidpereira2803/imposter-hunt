---
layout: default
title: How to Play
---

# How to Play Imposter Hunt

**Imposter Hunt** is a fast-paced social deduction game where players try to uncover who among them is the imposter — all on a single shared device.

## About the Game

Gather your friends and take turns passing the phone around. Everyone except one player receives a secret word from a chosen topic — but the **Imposter** has no clue!
Your goal: give hints, discuss, and vote out the impostor before they can figure out the word.

### How to Play

1. **Setup** – Add 3+ players and pick a topic (Food, Animals, Movies, Countries, or create custom topics).
2. **Role Reveal** – Each player privately views their role (Civilian or Imposter).
3. **Discussion** – Give subtle hints and try to expose the Imposter.
4. **Voting** – Decide who to vote out each round.
5. **Imposter Guess** – The Imposter has one chance to guess the secret word.
6. **Results** – Either the Imposter wins by guessing correctly or Civilians win by catching them!

### Win Conditions

* **Civilians Win**: 
  * The imposter is correctly voted out.
  * The imposter guesses the secret word incorrectly.
* **Imposter Wins**:
  * Correctly guesses the secret word.
  * Survives until only 2 players remain.

---

## Features

* **Pass-and-play multiplayer** — one device for all players.
* **AI-powered topic generation** — create custom topic lists with AI assistance.
* **Multiple game modes** — play with built-in topics or your own custom lists.
* **Clean minimal UI** optimized for quick social play.
* **Haptic feedback** for tactile interactions.
* **Round timer** with controls for discussion pacing.
* **Persistent storage** for player names, custom topics, and settings.
* **Multi-round gameplay** with elimination tracking.
* **Smart voting system** that handles ties and revotes.
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
  ├── setup.js              # Player & topic selection
  ├── role.js               # Role reveal screen
  ├── round.js              # Discussion phase
  ├── vote.js               # Voting phase
  ├── imposter-guess.js     # Imposter's final guess
  ├── results.js            # Game result screen
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
  │   │   └── Title.js
  │   ├── AdBanner.js       # Banner ad component
  │   └── LoadingScreen.js
  ├── contexts/
  │   └── AdConsentContext.js  # UMP consent management
  ├── store/
  │   ├── gameStore.js      # Game state management
  │   └── aiStore.js        # AI generation tracking
  ├── lib/
  │   ├── generateTopics.js # AI topic generation API
  │   └── rewardedAds.js    # Rewarded ad handling
  ├── config/
  │   └── api.js            # API configuration
  ├── data/
  │   └── topics.json       # Built-in topic lists
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

## Ad Integration

### Configuration

Ads are configured via `app.config.js` using environment variables:

```javascript
plugins: [
  [
    "react-native-google-mobile-ads",
    {
      androidAppId: process.env.ADMOB_APP_ID_ANDROID,
      iosAppId: process.env.ADMOB_APP_ID_IOS
    }
  ]
]
```

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

## Troubleshooting

### App crashes on AI generation page
* Verify environment variables are set in EAS secrets
* Check API endpoint is reachable
* Review logcat: `adb logcat | grep -E "Error|Exception"`

### Ads not showing
* Ensure AdMob app ID is configured in `app.config.js`
* Check UMP consent message is published in AdMob console
* Verify ad unit IDs are set in environment variables
* Test with Google's test ad unit IDs first

### Build fails
* Run `npx expo-doctor` to check configuration
* Verify `extra.eas.projectId` is set
* Check all required secrets are configured: `eas secret:list`
* Clear build cache: `eas build --clear-cache`

### Consent form not appearing
* Ensure UMP message is published in AdMob
* Check AdMob app ID matches your account
* For testing outside EEA, enable debug geography in `AdConsentContext.js`

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
