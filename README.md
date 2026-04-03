# E-sport

A SvelteKit + Capacitor mobile/web app for managing tournaments and leaderboards.

## Features

- Tournament creation and management
- Player/team leaderboards
- Account signup/login and password reset
- Android build via Capacitor

## Tech stack

- Frontend: SvelteKit + Vite
- Mobile: Capacitor (Android)
- Auth / DB: Supabase (see `src/lib/supabaseClient.ts`)
- Styling: Tailwind CSS + Bootstrap

## Prerequisites

- Node.js 18+ and npm
- Java JDK + Android SDK (for Android builds)
- Android Studio (recommended for running on devices/emulators)

## Setup (local development)

1. Clone the repository

   git clone <repository-url>
   cd E-sport

2. Install dependencies

   npm install

3. Environment

Create a `.env` (or set env vars for your platform) with at least:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

4. Run the dev server

   npm run dev

Scripts available (from `package.json`):

- `npm run dev` — start Vite dev server
- `npm run build` — build production web assets
- `npm run preview` — locally preview production build
- `npm run check` — run type/check tooling
- `npm run format` — run Prettier
- `npm run lint` — run Prettier check + ESLint

## Android (Capacitor) build

1. Sync Capacitor and open Android project

   npx cap sync android
   npx cap open android

2. Build & run

- Use Android Studio to build and run on emulator or device.

Notes:

- Ensure `android/local.properties` points to your Android SDK.
- Capacitor settings are in `capacitor.config.ts`.

## Deployment

- This project includes a static site adapter and is suitable for Vercel or other static hosts. Use `npm run build` then deploy the `build`/`output` folder as required by your host.

## Project structure (high level)

- `src/` — app source
  - `lib/` — helpers, `supabaseClient.ts`, components
  - `routes/` — SvelteKit routes (pages)
- `android/` — Capacitor Android project
- `static/` — static assets

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a pull request

Please run `npm run check` and `npm run format` before opening a PR.

## License

This project does not include a license file. Add a `LICENSE` if you wish to make the repo open source.

---

If you'd like, I can also:

- add a short CONTRIBUTING.md
- run the project's checks and formatters locally
- prepare a minimal release/deploy checklist for Vercel


<<<<<<< HEAD
# E-Sport_Calc
=======
# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
>>>>>>> 2da4c39 (initial commit)
