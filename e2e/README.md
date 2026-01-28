# E2E Tests (Maestro)

End-to-end tests for ChooseGOD using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Ensure the app is running on a simulator/emulator
npx expo run:ios   # or run:android
```

## Running Tests

```bash
# Run all tests
maestro test e2e/

# Run a specific test
maestro test e2e/onboarding.yaml
maestro test e2e/bible-navigation.yaml
maestro test e2e/offline-reading.yaml
```

## Test Flows

| File | What it tests |
|------|--------------|
| `onboarding.yaml` | App launch → welcome → "Get Started" → carousel → complete |
| `bible-navigation.yaml` | Bible tab → book → chapter → verses visible → swipe next chapter |
| `offline-reading.yaml` | Load chapter online → airplane mode → same chapter still displays |

## Writing New Tests

Tests use YAML format. Key commands:
- `tapOn` — tap element by text or `id` (testID)
- `assertVisible` — verify element is on screen
- `swipeLeft` / `swipeRight` — swipe gestures
- `toggleAirplaneMode` — toggle connectivity
- `back` — press back button

See [Maestro docs](https://maestro.mobile.dev/reference) for full API.
