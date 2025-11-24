# Imposter Hunt - Testing Checklist v1.0.4

## Setup Phase
- [ ] Can add 3+ players
- [ ] Can remove players
- [ ] Can select built-in topics
- [ ] Can select AI-generated topics
- [ ] Can create custom topics
- [ ] Special roles toggle works (4+ players)
- [ ] Special roles disabled with <4 players
- [ ] Game starts correctly

## Role Assignment
- [ ] Civilian sees secret word
- [ ] Imposter doesn't see secret word
- [ ] Jester doesn't see secret word (4+ players)
- [ ] Sheriff sees secret word (4+ players)
- [ ] Sheriff can inspect one player
- [ ] Sheriff inspection shows correct role
- [ ] All roles display correct missions

## Round Phase
- [ ] Timer works correctly
- [ ] Speaking order displayed
- [ ] Can navigate to voting
- [ ] Can quit game with warning

## Voting Phase
- [ ] All active players shown
- [ ] Can vote for a player
- [ ] Correct player eliminated
- [ ] Game continues to next round
- [ ] Game ends when appropriate

## Imposter Guess
- [ ] Imposter can make guess
- [ ] Correct guess → Imposter wins
- [ ] Wrong guess → Civilians win
- [ ] Can pass (civilians win)

## Win Conditions
- [ ] Civilians win by eliminating imposter
- [ ] Imposter wins by guessing word
- [ ] Imposter wins by surviving to 2 players
- [ ] Jester wins if eliminated
- [ ] Correct winner displayed on results

## Localization
- [ ] All languages display correctly (EN, DE, ES, FR, IT, LU, PT)
- [ ] AI topic names don't get translated
- [ ] Built-in topics translate properly

## Edge Cases
- [ ] What if sheriff is eliminated before using ability?
- [ ] What if jester is imposter? (shouldn't happen)
- [ ] What if only 3 players remain and one is jester?