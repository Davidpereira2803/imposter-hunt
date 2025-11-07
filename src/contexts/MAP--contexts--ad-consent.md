---
folder: src/contexts
owner: Davidpereira2803
status: stable
last_updated: 2025-11-05
provides: [react-contexts, ad-consent]
consumes: []
dependencies: [react-native-google-mobile-ads, AsyncStorage]
children: []
notes: "React Context providers for global state"
---
# Contexts

## Purpose
Provides React Context providers for application-wide concerns like ad consent management.

## Contents
| File/Folder | Kind | Summary | Status |
|---|---|---|---|
<!-- gen:files-start -->
| `AdConsentContext.js` | file | Context provider for Google Mobile Ads consent (GDPR/CCPA) | stable |
<!-- gen:files-end -->

## Interlinks
- **Imports/Uses:** <!-- gen:uses-start -->react (createContext, useContext), react-native-google-mobile-ads (AdsConsent), AsyncStorage<!-- gen:uses-end -->
- **Used By:** <!-- gen:used-by-start -->app/_layout.js (wraps app), src/components/AdBanner.js<!-- gen:used-by-end -->

## Contracts & Interfaces
- Exports `AdConsentProvider` component
- Exports `useAdConsent` hook returning consent state and functions
- Manages GDPR/CCPA consent flow and status

## Tests & Coverage
No test files present.

## TODO / Next Steps
- Add consent form UI customization
- Test consent flow in different regions
- Add consent logging/analytics
