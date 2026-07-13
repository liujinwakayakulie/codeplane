# codingplane

Real-time 1v1 troll arena where strangers roleplay as AIs and roast each other. One player asks a question as the **human**, a stranger picks it up as the **copilot** and writes the worst AI impression they can. Every round is a fresh stranger.

Live at **https://codingplane.me**

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind v4**
- **html-to-image** for Carbon-style PNG export
- In-memory matcher on the server (single-instance, **no DB**)
- SSE (`EventSource`) for real-time push, plain `fetch POST` for up-actions

## Architecture

```
browser ──GET /api/match/stream (SSE)──> │
                                         │  lib/server/matcher.ts
browser ──POST /api/match/* ────────────> │  (in-memory singleton)
```

The matcher holds four maps (humans/copolits/matches/subscribers) in process memory. Each tab generates its own `connId` in `sessionStorage`, so two tabs in the same browser act as two independent players — useful for self-testing.

**Why not serverless**: each request may hit a different instance with its own memory. We deploy to Railway (Hobby plan, single instance). Vercel/Cloudflare Workers won't work for the matcher.

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000
```

Open two browser tabs (one normal, one incognito) — one as HUMAN, one as COPILOT — to test the full match flow.

## Project layout

```
app/
  api/match/           # SSE stream + 4 POST routes (prompt/start-waiting/cancel-waiting/action)
  play/                # the actual game client
  history/             # local-only conversation log
  how-to-play/         # onboarding doc
  code-of-conduct/     # legal pages...
  terms-of-service/
  privacy-policy/
  icon.tsx             # dynamic favicon
  opengraph-image.tsx  # dynamic OG image
  twitter-image.tsx
  sitemap.ts / robots.ts
components/
  play/                # PlayClient orchestrator, ConnectionOverlay, ErrorToast
  copilot/             # CopilotStation (5-state task card)
  terminal/            # TerminalChat (human view) + MessageBubble + TypewriterText
  share/               # CarbonCard + ScreenshotExport + SelectActionBar
  energy/              # BatteryBar + UltimateSkillMenu
  effects/             # BlueScreen, CodeRainCollapse, CPUMelt, ScreenShutdown
  layout/              # TopNav, SiteFooter, ContactInfo
  onboarding/          # OnboardingTour (spotlight walkthrough)
  legal/               # LegalPage layout shell
hooks/
  useLiveMatch.ts      # the heart: SSE subscriber + up-action callers
  useEnergy.ts         # localStorage-backed battery counter
  useIdleRecovery.ts   # +10% every 2min idle, capped at +100%/day
  useConversations.ts  # IndexedDB subscription
  useCountdown.ts / useTypewriter.ts
lib/
  server/matcher.ts    # the singleton matcher
  client/conversationsDb.ts  # IndexedDB wrapper
  site.ts              # domain/title constants
  skills.ts            # ultimate metadata + cast messages
  tour.ts              # onboarding step definitions
  asciiArt.ts / models.ts
```

## Deployment

Push to `main` → Railway auto-deploys via Nixpacks. Domain wired through Cloudflare for DNS + CDN + DDoS protection.

## License

Proprietary — see `app/terms-of-service`.
