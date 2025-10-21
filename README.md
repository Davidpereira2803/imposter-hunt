# 🎭 Imposter Hunt

**Imposter Hunt** is a fast-paced social deduction game built with **React Native and Expo**, where players try to uncover who among them is the imposter — all on a single shared device.

## 🕹️ About the Game

Gather your friends and take turns passing the phone around. Everyone except one player receives a secret word from a chosen topic — but the **Imposter** has no clue!
Your goal: give hints, discuss, and vote out the impostor before they can figure out the word.

### 🔹 How to Play

1. **Setup** – Add 3+ players and pick a topic (Food, Animals, Movies, Countries).
2. **Role Reveal** – Each player privately views their role (Civilian or Imposter).
3. **Discussion** – Give subtle hints and try to expose the Imposter.
4. **Voting** – Decide who to vote out each round.
5. **Results** – Either the Imposter wins by guessing the word or Civilians win by catching them!

### 🏆 Win Conditions

* **Civilians Win**: The imposter is correctly voted out.
* **Imposter Wins**:

  * Correctly guesses the secret word.
  * Survives until only 2 players remain.

---

## ✨ Features

* 🧑‍🤝‍🧑 **Pass-and-play multiplayer** — one device for all players.
* 🎨 **Clean minimal UI** optimized for quick social play.
* 🔊 **Haptic feedback** for tactile interactions.
* ⏱️ **Round timer** with controls for discussion pacing.
* 💾 **Persistent storage** for player names & settings.
* 🔁 **Multi-round gameplay** with elimination tracking.
* 🧠 **Smart voting system** that handles ties and revotes.

---

## ⚙️ Built With

* **React Native** & **Expo (SDK 54)**
* **Expo Router** – File-based routing system.
* **Zustand** – Lightweight state management.
* **AsyncStorage** – Persistent data storage.
* **Expo Haptics** – For touch feedback.
* **Google Mobile Ads (AdMob)** – Configured for banner and test ads.

---

## 🧩 Installation

```bash
# Clone and install dependencies
npm install
```

### Start Development Server

```bash
npx expo start
```

---

## 📁 Project Structure

```
app/
  ├── index.js       # Main menu
  ├── setup.js       # Player & topic selection
  ├── role.js        # Role reveal screen
  ├── round.js       # Discussion phase
  ├── vote.js        # Voting phase
  ├── results.js     # Game result screen
  ├── settings.js    # Reset & preferences
  └── _layout.js     # Root layout / navigation
src/
  ├── components/
  ├── data/
  │   └── topics.json
  └── store/
      └── gameStore.js
```

---

## 📱 Building for Android

```bash
npx eas build -p android --profile preview
```

To prepare a production build for Google Play:

```bash
npx eas build -p android --profile production
```

---

## 🔒 Privacy

This app uses Google AdMob for ads.

* Only non-personalized ads are shown by default.
* Player data is stored locally on your device (no cloud sync).

See the [Privacy Policy](https://github.com/YOUR_GITHUB_USERNAME/imposter-hunt/blob/main/PRIVACY.md) for details.

---

## 🧠 Developer Notes

For technical documentation (architecture, dependencies, troubleshooting), see the [Developer Section](#developer-section).

---

## 💻 Developer Section

### State Management

Uses Zustand for centralized state (player list, topic, imposter, rounds). Persistent storage powered by AsyncStorage.

### Ads Setup

Configured in `app.json` via the `react-native-google-mobile-ads` plugin using test IDs.

### Native Build

To generate native folders:

```bash
npx expo prebuild
```

To clear caches:

```bash
npx expo start -c
npm cache clean --force
```

---

## 📜 License

© 2025 David Pereira — All rights reserved.
