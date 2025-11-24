# Imposter Hunt - Testing Checklist v1.0.4

## Automated Tests Status
- [x] Test Helpers (12 tests)
- [x] Game Store (36 tests)
- [ ] Word Matching Logic
- [ ] Game Flow Integration
- [ ] Component Tests

**Coverage:** Run `npm run test:coverage` to see current coverage

---

## Manual Testing Checklist

### Device Testing
- [ ] Android (tested on: _____________)
- [ ] iOS (tested on: _____________)
- [ ] Tablet (tested on: _____________)

### Setup Phase
- [ ] Can add 3+ players
- [ ] Can remove players
- [ ] Can select built-in topics
- [ ] Can select AI-generated topics
- [ ] Can create custom topics
- [ ] Special roles toggle works (4+ players)
- [ ] Special roles disabled with <4 players
- [ ] Game starts correctly
- [ ] Error shown if <3 players
- [ ] Error shown if no topic selected

### Role Assignment
- [ ] Civilian sees secret word
- [ ] Imposter doesn't see secret word
- [ ] Jester doesn't see secret word (4+ players)
- [ ] Sheriff sees secret word (4+ players)
- [ ] Sheriff can inspect one player
- [ ] Sheriff inspection shows correct role
- [ ] All roles display correct missions
- [ ] Can't go back after seeing role
- [ ] Haptic feedback on role reveal

### Round Phase
- [ ] Timer works correctly
- [ ] Timer sound/vibration at 10s
- [ ] Speaking order displayed
- [ ] Can navigate to voting
- [ ] Can quit game with warning
- [ ] Round number increments
- [ ] Previous rounds' info displayed

### Voting Phase
- [ ] All active players shown
- [ ] Eliminated players not shown
- [ ] Can vote for a player
- [ ] Can't vote for yourself
- [ ] Correct player eliminated
- [ ] Game continues to next round
- [ ] Game ends when appropriate
- [ ] Voting results clear

### Imposter Guess
- [ ] Imposter can make guess
- [ ] Correct guess → Imposter wins (exact match)
- [ ] Correct guess (case insensitive)
- [ ] Correct guess (with accents: café = cafe)
- [ ] Correct guess (with punctuation: "pizza!" = "pizza")
- [ ] Wrong guess → Civilians win
- [ ] Can pass → civilians win
- [ ] Keyboard works properly

### Sheriff Ability
- [ ] Sheriff can inspect once per game
- [ ] Can't inspect self
- [ ] Inspection shows correct role
- [ ] Can't inspect after already used
- [ ] Button disabled after use
- [ ] Works correctly if sheriff eliminated

### Win Conditions
- [ ] Civilians win by eliminating imposter
- [ ] Imposter wins by guessing word
- [ ] Imposter wins by surviving to 2 players
- [ ] Jester wins if eliminated
- [ ] Correct winner displayed on results
- [ ] Confetti/celebration for winner
- [ ] Can restart game

### Localization
- [ ] English (EN)
- [ ] German (DE)
- [ ] Spanish (ES)
- [ ] French (FR)
- [ ] Italian (IT)
- [ ] Luxembourgish (LU)
- [ ] Portuguese (PT)
- [ ] AI topic names don't get translated
- [ ] Built-in topics translate properly
- [ ] All UI elements translate

### Edge Cases
- [ ] Sheriff eliminated before using ability
- [ ] Jester never assigned as imposter
- [ ] Only 3 players remain with jester alive
- [ ] All special roles in one game (5+ players)
- [ ] App backgrounded during game
- [ ] Low memory conditions
- [ ] Slow network (AI topics)
- [ ] No network (AI topics fail gracefully)

### Performance
- [ ] Game starts in <1 second
- [ ] No lag during animations
- [ ] Smooth scrolling in player lists
- [ ] AI topic generation <5 seconds
- [ ] No memory leaks (play 10+ games)

### Accessibility
- [ ] Text readable (font sizes)
- [ ] Colors distinguishable
- [ ] Touch targets large enough
- [ ] Works in landscape mode (if supported)

---

## Bug Template

When you find a bug during manual testing:

**Bug:** [Short description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Device:** [Android/iOS, version]
**Priority:** [High/Medium/Low]

---

## Test Results

**Date:** __________
**Tester:** __________
**Version:** v1.0.4
**Pass Rate:** ___/___

**Critical Issues Found:**
- 

**Notes:**
-