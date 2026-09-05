# Offfline Mobile App (Pure React Native CLI)

A dedicated, high-performance **Bare React Native (Android + iOS)** mobile application for the **Water Plant / Manufacturer** and **Distributor** operations of the Offfline platform.

## Key Features

- **Pure React Native CLI**: Zero Expo dependencies. Clean bare setup with native `android/` and `ios/` projects.
- **Single Production Backend**: Direct integration with `https://api.offfline.in/api` using standard JWT tokens, refresh interceptors, and simulated clock headers.
- **Unified Login**: Exact UI and brand identity as the web frontend with role switcher (`WATER_PLANT` & `DISTRIBUTOR`), phone/email login, demo bypass buttons, and registration flows.
- **60 FPS VisionCamera QR Scanner**: Real-time barcode scanning powered by `react-native-vision-camera` (v4) with sound & haptic feedback (`react-native-haptic-feedback`), 1.2s duplicate prevention cache, and automatic GPS coordinate tagging.
- **Mandatory Location Enforcement**: High-accuracy GPS acquisition (`react-native-geolocation-service`) enforcing verifiable proof of bottling and retail delivery compliance.
- **Plant Dashboard**:
  - Bottling Queue with live progress, +100/+500/+5,000 rate boosters, and sleeve specification inspector.
  - Settlement ledger with 24H EOD countdown timer (10:00 PM IST) and payment disbursement requests.
  - Plant batch inventory and daily output logs.
- **Distributor Terminal**:
  - Real-time verified delivery scans grouped by IP / locality.
  - CanQR audit record details with GPS coordinates and timestamps.
  - Settlement overview with 24H EOD countdown timer (06:00 PM IST) and payment disbursement requests.

---

## Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install --legacy-peer-deps
```

### 2. Configure Environment
Check `.env` (defaults to production backend):
```env
BACKEND_ORIGIN=https://api.offfline.in
API_BASE_URL=https://api.offfline.in/api
VITE_API_BASE_URL=https://api.offfline.in/api
```

### 3. Run Development Server
```bash
# Start Metro Bundler
npm start

# Run on Android Emulator / Physical Device
npm run android

# Run on iOS Simulator (macOS required)
# (Ensure 'cd ios && pod install' is run first)
npm run ios
```

---

## Directory Structure

```
mobile/
├── App.tsx                      # Root component with Providers
├── index.js                     # React Native CLI entry point (AppRegistry)
├── metro.config.js              # Metro bundler configuration
├── babel.config.js              # React Native Babel preset
├── package.json                 # Dependencies & scripts
├── android/                     # Native Android project (Gradle, Manifest, Kotlin)
├── ios/                         # Native iOS project (Podfile, Info.plist, ObjC++)
└── src/
    ├── api/                     # Central Axios client & API methods
    │   ├── auth.ts
    │   ├── client.ts
    │   ├── distributor.ts
    │   ├── notifications.ts
    │   ├── payments.ts
    │   └── plant.ts
    ├── components/              # Shared UI components
    │   ├── CountdownTimer.tsx
    │   ├── Header.tsx
    │   ├── LocationEnforcer.tsx
    │   ├── MetricCard.tsx
    │   ├── StatusBadge.tsx
    │   ├── ToastBanner.tsx
    │   └── UserMenuModal.tsx
    ├── constants/               # Theme & config
    │   ├── config.ts
    │   └── theme.ts
    ├── context/                 # Auth & Location providers
    │   ├── AuthContext.tsx
    │   └── LocationContext.tsx
    ├── navigation/              # React Navigation stacks & tabs
    │   ├── AuthNavigator.tsx
    │   ├── DistributorNavigator.tsx
    │   ├── PlantNavigator.tsx
    │   └── RootNavigator.tsx
    ├── screens/                 # Screens & Modals
    │   ├── auth/
    │   │   ├── DistributorRegisterScreen.tsx
    │   │   ├── ForgotPasswordScreen.tsx
    │   │   ├── PlantRegisterScreen.tsx
    │   │   ├── StatusScreens.tsx
    │   │   └── UnifiedLoginScreen.tsx
    │   ├── distributor/
    │   │   ├── CanDetailModal.tsx
    │   │   ├── DistributorDashboardScreen.tsx
    │   │   └── DistributorProfileModal.tsx
    │   ├── plant/
    │   │   ├── PlantBatchesScreen.tsx
    │   │   ├── PlantDashboardScreen.tsx
    │   │   ├── PlantOrderDetailModal.tsx
    │   │   ├── PlantOutputScreen.tsx
    │   │   └── PlantProfileModal.tsx
    │   └── shared/
    │       ├── NotificationsScreen.tsx
    │       └── QRScannerModal.tsx
    ├── types/                   # TypeScript interfaces
    │   └── index.ts
    └── utils/                   # Helpers
        ├── formatters.ts
        ├── locationProfiles.ts
        ├── secureStorage.ts
        └── soundService.ts
```
