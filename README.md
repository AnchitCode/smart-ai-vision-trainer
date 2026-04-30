<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-6c8eff?style=for-the-badge" alt="Version 1.0.0" />
<img src="https://img.shields.io/badge/build-passing-4ade80?style=for-the-badge" alt="Build Passing" />
<img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.9" />
<img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
<img src="https://img.shields.io/badge/license-MIT-a78bfa?style=for-the-badge" alt="MIT License" />

<br /><br />

```
  ╔═══════════════════════════════════════════════╗
  ║     🤖  SMART AI VISION TRAINER  💪           ║
  ║   Real-Time AI Fitness Coach in Your Browser  ║
  ╚═══════════════════════════════════════════════╝
```

**Train with precision. Get coached in real-time. Your camera feed never leaves your device.**

[**Live Demo**](#) · [**Quick Start**](#-quick-start) · [**Documentation**](#-documentation) · [**Roadmap**](#-roadmap)

</div>

---

## ✨ What Is This?

**Smart AI Vision Trainer** is a browser-based SaaS fitness app powered by Google's MediaPipe Pose — the same computer vision tech used in professional motion-capture studios, now running entirely on your webcam at 30+ FPS with zero server round-trips.

Point your camera → the AI detects your body, counts your reps, corrects your form, and coaches you by voice. When you're done, your stats sync to the cloud. **No app download. No wearable. No gym equipment.**

```
Webcam → MediaPipe Pose (WASM) → Joint Angle Analysis → Rep Counter → Form Validator → Voice Coach
                                                                                              ↓
                                                                                    Supabase (PostgreSQL)
```

---

## 🎯 Core Features

| Feature | How It Works |
|---|---|
| **🦴 33-Point Pose Detection** | MediaPipe WASM model runs locally at 30+ FPS — no video ever leaves your browser |
| **🔢 Automatic Rep Counting** | Biomechanical state machines count reps by measuring joint angles in real-time |
| **✅ Form Validation** | Per-exercise checks flag common errors (rounded back, arm swing, partial reps) |
| **🎙️ Voice Coaching** | Browser-native Speech Synthesis delivers praise and correction cues hands-free |
| **📊 Workout History** | Every session is persisted to PostgreSQL (Supabase) for long-term tracking |
| **🌗 Dark / Light Theme** | Full CSS token system with `localStorage` persistence — zero flash on reload |
| **📱 Fully Responsive** | Works on desktop and mobile, hamburger nav included |

---

## 🏋️ Supported Exercises

<table>
  <tr>
    <th>Exercise</th>
    <th>Detection Method</th>
    <th>Form Check</th>
  </tr>
  <tr>
    <td>💪 <strong>Bicep Curls</strong></td>
    <td>Elbow angle — UP: &lt;40°, DOWN: &gt;140°</td>
    <td>Lateral elbow drift ≤ 0.08 normalized</td>
  </tr>
  <tr>
    <td>🏗️ <strong>Push-Ups</strong></td>
    <td>Elbow angle — UP: &gt;160°, DOWN: &lt;90°</td>
    <td>Hip–shoulder–knee alignment ≥ 150°</td>
  </tr>
  <tr>
    <td>🪑 <strong>Squats</strong></td>
    <td>Knee angle — UP: &gt;160°, DOWN: &lt;90°</td>
    <td>Torso upright — hip angle ≥ 60°</td>
  </tr>
  <tr>
    <td>⭐ <strong>Jumping Jacks</strong></td>
    <td>Arms above shoulders + feet spread &gt;0.25</td>
    <td>Wrists ≥ 5% frame height above shoulders</td>
  </tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x and **npm** ≥ 9.x
- A [Supabase](https://supabase.com) project (free tier works perfectly)
- A device with a **webcam**
- **Chrome, Edge, or Firefox** (Safari has limited MediaPipe WASM support)

### Setup in 5 Steps

```bash
# 1. Clone the repo
git clone https://github.com/anchitgupta/smart-ai-vision-trainer.git
cd smart-ai-vision-trainer

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

```bash
# 4. Initialize the database
# → Go to Supabase Dashboard → SQL Editor
# → Paste the contents of supabase/schema.sql and run it

# 5. Start the dev server
npm run dev
# → http://localhost:5173
```

### Available Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript check + production bundle
npm run lint      # ESLint across the full codebase
npm run preview   # Serve the production build locally
```

---

## 🏗️ Architecture

### How It All Fits Together

```
┌─────────────────────────────── BROWSER (100% client-side AI) ────────────────────────────┐
│                                                                                            │
│   Webcam → <video> → usePose() hook                                                       │
│                           │                                                                │
│                    MediaPipe Pose (WASM)   ← loaded from CDN, ~30MB, never bundled        │
│                           │ 33 landmarks                                                   │
│                    angleCalculator.ts      ← dot product / acos vector math               │
│                           │ joint angles                                                   │
│                    Exercise Counter        ← pushup / squat / curl / jumpingJack          │
│                           │ rep count + state                                              │
│                    formValidator.ts        ← biomechanical threshold checks               │
│                           │ GOOD | BAD                                                    │
│                    voiceCoach.ts           ← SpeechSynthesis API, 2s cooldown            │
│                                                                                            │
│   UI: PoseOverlay (canvas) + HUD + WorkoutTimer + WorkoutSummary                         │
└───────────────────────────────────────────────────────────── on workout end ──────────────┘
                                                                        │
                                                              ┌─────────▼──────────┐
                                                              │  Supabase (remote) │
                                                              │  ├── Auth (JWT)    │
                                                              │  ├── profiles      │
                                                              │  ├── workout_sess… │
                                                              │  └── exercise_sets │
                                                              └────────────────────┘
```

### Workout State Machine

The workout experience follows a strict 7-state machine — no ambiguous transitions, ever.

```
[idle] ──Start──▶ [requesting_camera] ──Granted──▶ [loading_model] ──Ready──▶ [countdown]
                                                                                      │
         [completed] ◀──End Workout── [active_workout] ◀──────────────────── 3..2..1..GO
                                            │  ▲
                                      Pause │  │ Resume
                                            ▼  │
                                         [paused]

Any state ──Camera/Model failure──▶ [error]
```

### Provider Hierarchy

```tsx
<StrictMode>
  <AuthProvider>       {/* Supabase session → React context */}
    <BrowserRouter>    {/* Client-side routing */}
      <ThemeProvider>  {/* Dark/Light + localStorage */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </AuthProvider>
</StrictMode>
```

---

## 🗄️ Database Schema

All tables have **Row Level Security (RLS)** enabled. Users can only ever read or write their own data (`auth.uid() = user_id`).

```sql
profiles              -- Auto-created via trigger on auth.users insert
  ├── id              uuid  PK  FK→auth.users
  └── member_since    timestamptz

workout_sessions      -- One row per completed workout
  ├── id              uuid  PK
  ├── user_id         uuid  FK→auth.users
  ├── start_time      timestamptz
  ├── end_time        timestamptz
  ├── total_reps      integer
  ├── good_reps       integer
  └── bad_reps        integer

exercise_sets         -- Per-exercise breakdown within a session
  ├── id              uuid  PK
  ├── session_id      uuid  FK→workout_sessions (CASCADE)
  ├── user_id         uuid  FK→auth.users
  ├── exercise_type   text   -- 'PUSHUP' | 'SQUAT' | 'CURL' | 'JUMPING_JACK'
  └── reps            integer
```

---

## 🛣️ Pages & Routes

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Animated 6-section marketing landing page |
| `/auth` | Public | Email/password sign in + sign up |
| `/workout` | 🔒 Private | Live AI workout experience |
| `/history` | 🔒 Private | Past sessions dashboard |
| `/profile` | 🔒 Private | Account identity + fitness summary |
| `/settings` | 🔒 Private | Theme toggle + future settings |

---

## 🎨 Design System

The visual identity is driven entirely by CSS custom properties — no CSS framework, no Tailwind, zero dependency bloat. Every component references design tokens, never raw values.

```css
/* A taste of the token system (theme.css) */
--color-bg-primary:      #060918;        /* Page background     */
--color-accent-primary:  #6c8eff;        /* Buttons, links      */
--color-neon-cyan:       #00e5ff;        /* Skeleton overlay    */
--color-success:         #4ade80;        /* Good form           */
--color-error:           #f97373;        /* Bad form / errors   */
--gradient-brand:        /* blue → purple brand gradient */
```

Two complete theme variants are defined: `[data-theme="dark"]` (default) and `[data-theme="light"]`, with preference stored in `localStorage`.

---

## 🚢 Deployment

The app builds to a fully static SPA (`dist/`) — deploy anywhere.

### Bundle Size

```
dist/index.html              2.58 KB  │  gzip:  1.02 KB
dist/assets/index-*.css     57.26 KB  │  gzip: 10.20 KB
dist/assets/pose-*.js       47.08 KB  │  gzip: 17.56 KB  ← MediaPipe chunk
dist/assets/index-*.js     483.33 KB  │  gzip: 141.98 KB ← Main app
```

### Vercel (Recommended)

```bash
npm i -g vercel && vercel
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel dashboard, then add a `vercel.json` for the required security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy",   "value": "same-origin"  },
        { "key": "Cross-Origin-Embedder-Policy",  "value": "require-corp" }
      ]
    }
  ]
}
```

### Netlify

Deploy the `dist/` folder and add a `public/_headers` file:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

> **Why these headers?** MediaPipe's SIMD WASM binary uses `SharedArrayBuffer`, which requires COOP/COEP headers to be set. Without them, pose detection will fall back to a slower single-threaded path.

> **Note:** Camera access (`getUserMedia`) requires **HTTPS** or `localhost`. HTTP deployments will not work.

---

## 🔭 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Build Tool | Vite | 7.3.1 |
| Framework | React | 19.2.0 |
| Language | TypeScript | 5.9.3 |
| Routing | React Router DOM | 7.13.2 |
| ML Engine | MediaPipe Pose | 0.5.x |
| Auth & DB | Supabase | 2.101.1 |
| Voice | Web Speech API | Browser built-in |
| Styling | Vanilla CSS (token system) | — |
| Linting | ESLint | 9.39.1 |

---

## ⚠️ Known Limitations (V1)

- **Safari support is limited** — MediaPipe WASM has partial compatibility; Chrome or Edge recommended.
- **Single exercise per session** — you pick one exercise before starting; switching mid-workout resets reps.
- **No offline mode** — workout history requires an active Supabase connection to save.
- **Lighting sensitivity** — MediaPipe confidence drops in low-light conditions; a well-lit room is recommended.
- **Jumping Jacks require full-body framing** — the camera needs to capture head-to-toe for the compound detection to work reliably.

---

## 🗺️ Roadmap

- [ ] Multi-exercise workout programs (planned sequences, rest timers)
- [ ] Rep target goals with completion alerts
- [ ] Offline PWA support with sync-on-reconnect
- [ ] Historical charts and progress graphs on the History page
- [ ] Social sharing — shareable workout summary cards
- [ ] Custom exercise builder via configurable angle thresholds
- [ ] Safari / WebKit MediaPipe compatibility fix

---

## 📁 Project Structure (Top-Level)

```
smart-ai-vision-trainer/
├── src/
│   ├── engine/          # AI counters, form validators, voice coach
│   ├── hooks/           # usePose (core), useCamera, useInView
│   ├── pages/           # Home, Auth, Workout, History, Profile, Settings
│   ├── components/      # Camera, HUD, PoseOverlay, Layout, UI primitives
│   ├── context/         # AuthContext, ThemeContext
│   ├── styles/          # theme.css (design tokens), animations.css
│   ├── services/        # workoutService (Supabase writes)
│   └── types/           # ExerciseType, Pose types
├── supabase/
│   └── schema.sql       # Full DB schema with RLS policies
├── documentation/       # Architecture, phase notes, this doc
└── public/              # Static assets
```

~65 source files · 0 TypeScript errors · Production bundle ≈ 484 KB JS + 57 KB CSS

---

## 📄 License

MIT © 2026 Anchit Gupta — see [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built with MediaPipe · React · Supabase · 💙

**[⬆ Back to top](#)**

</div>
