---
layout: default
title: Changelog - Version History
---

# Changelog

All notable changes to The Munkeler are documented here.

---

## [v1.0.8] - Current Release

**Released:** December 2025

### New Features
- **AI Generator Tutorial** - Added interactive tutorial explaining how AI topic generation works
- **Rotating AI Examples** - Dynamic topic examples in AI generator for inspiration
- **Vote Confirmation Dialog** - Added player name confirmation before elimination to prevent accidents
- **Round Information Display** - Shows current round and remaining players in voting screen
- **Collapsible Topic Section** - Topic grid in setup screen now collapses by default to reduce scrolling

### Bug Fixes
- **Fixed Swipe Navigation** - Back gestures now properly navigate between screens instead of triggering exit dialog
- Corrected version display in settings screen

### Improvements
- **Screen Adaptation** - Better handling of OS navigation buttons and status bar
- **Orientation Support** - Removed orientation and resizability restrictions for better flexibility
- **Theme Update** - Changed primary theme color to red for better brand identity
- **Role Icons** - Added visual icons for Jester and Sheriff roles in setup screen
- **Smooth Animations** - Enhanced voting selection with spring animations for better visual feedback

---

## [v1.0.7] - Production Ads

**Released:** November 2025

### New Features
- **Production Ad Integration** - Implemented Google AdMob with production ad units
- **Ad Optimization** - Fine-tuned banner and rewarded ad placements

---

## [v1.0.6] - First Production Release

**Released:** November 2025

### Milestone
- **Official Launch** - First stable production release on Google Play Store
- **Performance Optimization** - Improved app stability and performance
- **Quality Assurance** - Comprehensive testing and bug fixes

---

## [v1.0.5] - Bug Fixes & Tutorial Update

**Released:** October 2025

### Bug Fixes
- **Homescreen Topic Bar** - Fixed display issue with topic information bar
- **Imposter Guess** - Resolved input and validation issues in guess screen

### Improvements
- **Tutorial Enhancement** - Updated tutorial with special roles and latest features
- **UX Polish** - Minor UI refinements across multiple screens

---

## [v1.0.4] - Special Roles System 🎭

**Released:** October 2025

### Major Features
- **Special Roles System** - Introduced Jester and Sheriff roles (requires 4+ players)
  - **Jester** 🃏 - Win by getting voted out! Act suspicious and trick others into eliminating you
  - **Sheriff** 🛡️ - Inspect one player's role during the round to help civilians find the imposter
- **Role-Specific Missions** - Added unique objectives for each role with clear visual indicators
- **Enhanced Role Reveal** - Redesigned role screen with distinct colors and icons for all 4 roles

### Voting System Upgrade
- **Jester Win Condition** - Voting system now handles Jester elimination as a solo victory
- **Improved Voting UI** - Better visual feedback during vote casting and results

### Round Screen Improvements
- **Discrete Timer Controls** - Icon-only play/pause/reset buttons integrated inside the circular timer
- **Cleaner Interface** - Reduced visual clutter while maintaining full functionality

### Language Support
- Added **Italian** (Italiano) 🇮🇹
- Added **Spanish** (Español) 🇪🇸
- Now supporting **7 total languages**

### Home Screen Restructure
- **Quick Access** - Added direct link to AI topic generator from home screen
- **Player Count Clarity** - Improved messaging about minimum player requirements (based on community feedback)

### UI Consistency
- Standardized design patterns across all game screens
- Improved visual hierarchy and spacing
- Enhanced color coding for different roles

---

## [v1.0.3] - UX Improvements

**Released:** September 2025

### New Features
- **View Role During Round** - Players can now check their role anytime during discussion phase
- **Improved Button Text** - Context-aware button labels that adapt to selected language

### UI/UX Redesign
- **AI Topics Screen Restructure** - Completely redesigned AI topic generator based on Reddit community feedback
  - Clearer generation limits display
  - Better prompt input experience
  - Improved results presentation
- **Homescreen Enhancement** - Added more information about game modes and features

### Localization
- Improved translation quality across all supported languages
- Fixed missing translations in special screens

---

## [v1.0.2] - Initial Enhancements

**Released:** September 2025

### New Features
- **Civilian Elimination Modal** - Added confirmation dialog when eliminating players
- **Homepage Restructure** - Improved navigation and information architecture

### Language Improvements
- Completed and corrected all language locales
- Ensured full feature parity across all 5+ languages

### Bug Fixes
- Various stability improvements
- UI polish and minor bug fixes

---

## [v1.0.0 - v1.0.1] - Initial Release

**Released:** August 2025

### Core Features
- **Pass-and-Play Gameplay** - Social deduction game for 3-12 players on one device
- **Built-in Topics** - Food, Animals, Movies, Countries, and more
- **Custom Topics** - Create your own word lists
- **AI Topic Generation** - Generate custom topics with AI assistance
  - 1 free generation per day
  - Up to 5 bonus generations via rewarded ads
- **Multi-Language Support** - English, French, German, Portuguese, Luxembourgish
- **Offline Play** - No internet required for core gameplay
- **Beautiful UI** - Modern, polished dark theme
- **Haptic Feedback** - Tactile responses for all interactions
- **Tutorial Mode** - Interactive tutorial for first-time players
- **Privacy-First** - All data stored locally, no accounts required

### Game Mechanics
- Role assignment (Civilian vs Imposter)
- Discussion phase with round timer
- Voting system with tie handling
- Imposter guess mechanism
- Multiple win conditions

### Technical
- Built with React Native & Expo SDK 54
- Zustand state management with persistence
- Google Mobile Ads integration
- Ad consent management (UMP SDK)

---

## Planned Features

Future updates may include:

- **iOS Version** - Bring The Munkeler to Apple devices
- **More Special Roles** - Additional roles beyond Jester and Sheriff
- **Custom Game Modes** - Alternative rule sets and variants
- **Topic Management** - Edit and organize custom topics
- **Enhanced Statistics** - Game history and player stats
- **Additional Languages** - Community-requested language support
- **Accessibility Features** - Screen reader support, colorblind modes

---

## Version Naming

IThe Munkeler follows semantic versioning:
- **Major (X.0.0)** - Significant new features or breaking changes
- **Minor (1.X.0)** - New features, backward compatible
- **Patch (1.0.X)** - Bug fixes and minor improvements

---

## Report Bugs

Found a bug in the latest version?

- [Open a GitHub Issue](https://github.com/Davidpereira2803/imposter-hunt/issues)
- Include your app version (visible in Settings)
- Describe steps to reproduce
- Attach screenshots if possible

---

## Suggest Features

Have an idea for the next version?

- [Submit a Feature Request](https://github.com/Davidpereira2803/imposter-hunt/issues/new)
- Explain the feature and its benefits
- Community voting helps prioritize development

---

## Download Latest Version

Get the newest release on Google Play:

<div class="cta-section">
  <a href="https://play.google.com/store/apps/details?id=com.davidpereira2803.imposterhunt" class="btn-download">
    Download v1.0.8
  </a>
  <p style="margin-top:1rem;">
    <span class="badge badge-success">Latest</span>
    <span class="badge">Android 6.0+</span>
    <span class="badge">~50 MB</span>
  </p>
</div>

---

## Documentation

- **[How to Play](HowToPlay)** - Game rules and strategies
- **[FAQ](FAQ)** - Frequently asked questions
- **[Screenshots](Screenshots)** - Visual tour of the app
- **[Privacy Policy](Privacy)** - Data and privacy details

---

[Back to Home]({{ site.baseurl }}/) | [How to Play](HowToPlay) | [Strategy Guide](Strategy-Guide) | [Features](Features) | [Screenshots](Screenshots) | [Changelog](Changelog) | [Privacy](Privacy)