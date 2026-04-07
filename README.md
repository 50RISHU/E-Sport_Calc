# 🎮 E-sport

A cross-platform **SvelteKit + Capacitor** app for managing esports tournaments, teams, matches, and real-time leaderboards.

**Live Demo:** https://esportcalc.vercel.app/

---

## 📋 Overview

E-sport is a comprehensive tournament management system designed for competitive gaming. It enables tournament organizers to create tournaments, set up teams, manage match results, and display live leaderboards. The app is built as a responsive web application and is also wrapped for mobile deployment via Capacitor.

## ✨ Core Features

### Tournament Management
- Create and configure tournaments with custom settings
- Define tournament structure (teams, participants, scoring)
- Real-time tournament status tracking

### Team & Player Management
- Create and manage teams within tournaments
- Add players to teams with role assignments
- Track team performance metrics

### Match Scheduling & Results
- Schedule matches and define matchups
- Record live match results and scores
- Support for various game formats and scoring systems
- Automatic leaderboard recalculation

### Leaderboards & Rankings
- Real-time leaderboard updates
- Multi-criteria ranking (wins, points, differential)
- Per-tournament and global statistics
- Player and team rankings

### User Authentication
- Secure signup and login via Supabase Auth
- Password reset functionality
- Session management with OAuth support

### Multi-Platform Support
- Responsive web app (mobile & desktop)
- Native Android app via Capacitor
- iOS-ready architecture (Capacitor-compatible)

---

## 🏗️ Architecture

### Frontend Stack
- **SvelteKit** — modern reactive component framework with file-based routing
- **Vite** — lightning-fast build tool and dev server
- **Tailwind CSS v4** — utility-first styling with responsive design
- **Bootstrap Icons** — comprehensive icon library

### Backend & Data
- **Supabase** — PostgreSQL database + authentication + real-time capabilities
- **Supabase Client** (`src/lib/supabaseClient.ts`) — singleton pattern for consistent access
- Real-time subscriptions for live match data

### Mobile
- **Capacitor** — web-to-native bridge for Android/iOS
- **Android Studio** — build and deploy Android apps
- Deep linking support for auth callbacks

### State Management
- **Reactive Stores** (`src/lib/stores/tournamentStore.ts`)
- Central store for tournaments, teams, matches
- Custom methods for data mutations and refreshes
- Automatic reactivity in components

---

## 📁 Project Structure

```
E-sport/
├── src/
│   ├── lib/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── dashboard/        # Dashboard-specific components
│   │   │   ├── Navbar.svelte     # Navigation bar
│   │   │   ├── TournamentCard.svelte
│   │   │   ├── TeamCard.svelte
│   │   │   ├── LeaderboardRow.svelte
│   │   │   ├── MatchEntryForm.svelte
│   │   │   ├── PointCard.svelte
│   │   │   ├── ImageUploader.svelte
│   │   │   └── ...               # Other components
│   │   ├── stores/
│   │   │   └── tournamentStore.ts # Central state management
│   │   ├── supabaseClient.ts      # Supabase client instance
│   │   ├── images/               # Image assets
│   │   └── assets/               # Misc assets
│   ├── routes/                   # SvelteKit file-based routing
│   │   ├── +layout.svelte        # Global layout wrapper
│   │   ├── +layout.ts            # Layout configuration
│   │   ├── +page.svelte          # Home page
│   │   ├── dashboard/+page.svelte # Dashboard page
│   │   ├── tournament/
│   │   │   ├── [id]/+page.svelte    # Tournament detail view
│   │   │   └── create-tournament/   # Create tournament page
│   │   ├── auth/
│   │   │   ├── login/+page.svelte
│   │   │   ├── signup/+page.svelte
│   │   │   └── callback/+page.svelte
│   │   ├── forgot-password/
│   │   │   └── +page.svelte
│   │   ├── update-password/
│   │   │   └── +page.svelte
│   │   └── layout.css            # Global styles
│   ├── app.html                  # HTML shell
│   └── app.d.ts                  # Global TypeScript types
├── android/                      # Capacitor Android project
│   ├── app/
│   ├── gradle/
│   └── ...                       # Android build files
├── static/                       # Static assets
├── build/                        # Production build output
├── capacitor.config.ts           # Capacitor configuration
├── vite.config.js                # Vite configuration
├── svelte.config.js              # SvelteKit configuration
└── package.json                  # Dependencies & scripts
```

---

## 🔧 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Web Framework** | SvelteKit | 2.48.5 |
| **Build Tool** | Vite | 7.2.2 |
| **Component Framework** | Svelte | 5.43.8 |
| **Styling** | Tailwind CSS | 4.1.17 |
| **Backend** | Supabase | 2.87.3 |
| **Mobile** | Capacitor | 8.0.0 |
| **Auth & DB** | Supabase (PostgreSQL) | - |
| **Package Manager** | npm | - |
| **Language** | JavaScript/TypeScript | TS 5.9.3 |

---

## 🌐 Key URL Routes

| Route | Purpose |
|-------|---------|
| `/` | Home landing page |
| `/login` | User login |
| `/signup` | New user registration |
| `/forgot-password` | Password reset request |
| `/update-password` | Password change page |
| `/dashboard` | Main tournament dashboard |
| `/tournament/[id]` | Individual tournament view & management |
| `/tournament/create-tournament` | Create new tournament |
| `/auth/callback` | OAuth/email callback handler |

---

## 🔐 Authentication Flow

1. **Local Auth** — Email + password login/signup via Supabase
2. **OAuth** — Optional third-party provider integration
3. **Session Management** — Client-side session with manual refresh
4. **Mobile Support** — Deep linking for auth callbacks on Capacitor
5. **Password Reset** — Email-based password recovery

---


