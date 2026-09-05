# Weekly Apps

A new small app, random genre, every Friday — built automatically by a scheduled Claude Code Remote routine and published free on GitHub Pages.

**Live site:** https://haruikntv.github.io/weekly-apps/

## Why not the App Store?

Publishing to the Apple App Store requires an Apple Developer Program membership (**$99/year**), which isn't free. Per the project owner's decision (2026-09-05), this project skips App Store submission entirely: each app is built with Expo (React Native + TypeScript), exported for web, and deployed as a free static site / PWA instead.

## How it works

1. Every Friday at 21:00 JST, a scheduled cloud routine (Claude Code Remote) runs against this repo.
2. It reads `manifest.json` for genres already used and the genre pool, picks an unused genre, and scaffolds a new working Expo app under `apps/<date>-<slug>/`.
3. It commits and pushes to `main`.
4. A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) automatically builds every app's web export and publishes them all to GitHub Pages — no external tokens or secrets required, everything uses the built-in `GITHUB_TOKEN`.
5. `manifest.json` is updated with a new history entry, and the site index (`scripts/generate-index.js`) regenerates a card for the new app.

## Repo layout

- `manifest.json` — genre pool + history of every app built so far (name, genre, date, folder, description).
- `apps/<date>-<slug>/` — one Expo project per week.
- `scripts/generate-index.js` — builds the `site/index.html` landing page listing all apps, run by CI.
- `.github/workflows/deploy-pages.yml` — builds every app for web and deploys to GitHub Pages on every push to `main`.

## Notes for whoever (or whatever) picks this up later

- There's no way to check "Claude usage headroom" from inside a session — no tool exposes rate-limit/usage status. The owner chose to run this unconditionally every Friday instead of trying to gate it on usage.
- Keep each app small and genuinely functional — a working single-purpose app beats a half-finished ambitious one.
- One-time manual setup still required (see below) before the first automated run will actually go live.

## One-time manual setup (do this once, then it's fully automatic)

1. In this repo's **Settings → Pages**, set **Source** to **GitHub Actions**. (Can't be done via API/CLI without a token — needs a manual click once.)
2. Nothing else — no secrets, no Vercel/Apple accounts needed.
