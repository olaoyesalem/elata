@AGENTS.md

# MindCanvas — Biofeedback Art Studio

## Dev commands
- `npm run dev` — start dev server on http://localhost:3000
- `npm run build` — production build
- `npm run lint` — lint

## Project layout
```
app/
  page.tsx              Landing (dark, ambient flow field)
  layout.tsx            Root layout + BioSignalProvider
  globals.css           All CSS design tokens (OKLCH palette)
  session/page.tsx      Studio tabs: heart | eeg | calmness | canvas | breathing
  sessions/page.tsx     Sessions archive (light mode)
  sessions/[id]/page.tsx  Session replay
  gallery/page.tsx      Public gallery (light mode)
  mint/[id]/page.tsx    NFT mint stub
  onboarding/page.tsx   Camera + BLE setup

components/
  FlowField.tsx         Canvas particle system — core generative art
  Primitives.tsx        Shared: Wordmark, Sparkline, BandBars, Brackets…
  HeartGlow.tsx         Day 1 — pulsing orb driven by BPM
  EegDashboard.tsx      Day 2 — oscilloscope + band powers
  CalmnessView.tsx      Day 3 — gradient bg + score arc
  GenerativeCanvas.tsx  Day 4 — full-screen bio-canvas
  BreathingCoach.tsx    Day 6 — 4·7·8 / box breathing guide
  Onboarding.tsx        Setup stepper

hooks/
  useRPPG.ts            rPPG heart rate (mock falls back to simulation)
  useEegDevice.ts       BLE EEG device (mock falls back to simulation)
  useEegProcessing.ts   Band powers from raw EEG samples
  useCalmness.ts        Calmness model + alpha bump detector

lib/
  BioSignalContext.tsx  React context aggregating all bio signals
  sessionRecorder.ts    IndexedDB via `idb`
```

## Design system
All tokens in `app/globals.css`. Key values:
- Dark bg: `--mc-ink-000` → `--mc-ink-700` (oklch 200° hue)
- Light bg: `--mc-bone-000` → `--mc-bone-900` (oklch 90° hue)
- Phosphor green: `--mc-phos` oklch(0.86 0.20 145)
- Wet cyan: `--mc-wet` oklch(0.78 0.13 200)
- Pulse red: `--mc-pulse` oklch(0.72 0.21 25)
- Typography: Georgia italic (`mc-display`), ui-monospace (`mc-data`, `mc-eyebrow`)

## Elata SDK
Optional packages — guarded with try/catch dynamic imports. Falls through to mock simulation when packages not installed. To plug in the real SDK, implement inside the existing try blocks in `hooks/useRPPG.ts` and `hooks/useEegDevice.ts`.
