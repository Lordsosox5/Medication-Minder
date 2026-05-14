# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── dose/               # Expo React Native mobile app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Dose App (artifacts/dose)

### Overview
A polished mobile medication reminder app built with Expo Router.

### Features
- **5 Screens**: Splash → Home Dashboard → Add/Edit Medication → Dose Calculator → Settings
- **Bilingual**: Full English and Arabic support with RTL layout when Arabic is selected
- **Light/Dark theme**: System-adaptive with manual override
- **Kid-friendly purple theme**: Purple primary palette across light/dark modes, splash screen, and edit form surfaces
- **Smart countdown**: Real-time per-second countdown for each medication
- **Medication tracking**: Add pills/injections with recurrence intervals (2h, 4h, 6h, 8h, 12h, 24h)
- **Status system**: Upcoming, Due Now, Overdue, Confirmed Recently states
- **Confirm Intake**: Single-tap to confirm and auto-schedule next dose
- **Persistent storage**: All data saved with AsyncStorage
- **Sorting**: By next due, overdue first, or alphabetical
- **Search & Filter**: Real-time search with filter chips
- **Dose Calculator**: Weight-based pediatric dose calculator using the attached dosage reference table, with searchable medicines, categories, frequency, concentration, and warnings.

### Key Files
- `app/index.tsx` — Splash screen with animated entrance
- `app/(tabs)/_layout.tsx` — Tab navigation (NativeTabs on iOS 26+ for liquid glass)
- `app/(tabs)/index.tsx` — Home / Medications Dashboard
- `app/(tabs)/add.tsx` — Add / Edit Medication Screen
- `app/(tabs)/calculator.tsx` — Pediatric dose calculator from the attached reference table
- `app/(tabs)/settings.tsx` — Settings Screen
- `context/AppContext.tsx` — Global state management with AsyncStorage
- `constants/colors.ts` — Purple theme colors (light/dark)
- `constants/i18n.ts` — English/Arabic translation strings

### Tech Stack
- **Framework**: Expo SDK 54, Expo Router v6
- **UI**: React Native with custom StyleSheet
- **Icons**: @expo/vector-icons (MaterialCommunityIcons, Feather)
- **Fonts**: Tajawal (Arabic) + Inter (English) from @expo-google-fonts
- **State**: React Context + AsyncStorage
- **Notifications**: expo-notifications (installed, ready for alarm scheduling)
- **Haptics**: expo-haptics for tactile feedback
- **Ads**: @mrnitrox/react-native-unity-ads-monetization — Unity Ads (Game ID: 6115331), initialized at app start; supports interstitial and rewarded video ads

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
