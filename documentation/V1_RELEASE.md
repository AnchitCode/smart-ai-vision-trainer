# Smart AI Vision Trainer — V1 Release Documentation

> **Version**: 1.0.0  
> **Release Date**: April 8, 2026  
> **Stack**: Vite 7 · React 19 · TypeScript 5.9 · MediaPipe Pose · Supabase  
> **Build Status**: ✅ Clean — 0 TypeScript errors, production bundle ≈ 484 KB JS + 57 KB CSS

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Complete File Structure](#4-complete-file-structure)
5. [Core Features — Detailed Breakdown](#5-core-features--detailed-breakdown)
   - 5.1 [AI Pose Detection Engine](#51-ai-pose-detection-engine)
   - 5.2 [Exercise Tracking (4 Exercises)](#52-exercise-tracking-4-exercises)
   - 5.3 [Form Validation System](#53-form-validation-system)
   - 5.4 [Voice Coaching](#54-voice-coaching)
   - 5.5 [Workout State Machine](#55-workout-state-machine)
   - 5.6 [Workout Persistence & History](#56-workout-persistence--history)
6. [Authentication & Database](#6-authentication--database)
   - 6.1 [Supabase Auth Flow](#61-supabase-auth-flow)
   - 6.2 [Database Schema](#62-database-schema)
   - 6.3 [Row Level Security (RLS)](#63-row-level-security-rls)
7. [Pages & Routing](#7-pages--routing)
8. [Design System](#8-design-system)
   - 8.1 [Theme Architecture](#81-theme-architecture)
   - 8.2 [Color Palette](#82-color-palette)
   - 8.3 [Typography & Spacing](#83-typography--spacing)
   - 8.4 [Animation System](#84-animation-system)
9. [Landing Page Sections](#9-landing-page-sections)
10. [Component Reference](#10-component-reference)
11. [Environment Variables](#11-environment-variables)
12. [Local Development Setup](#12-local-development-setup)
13. [Production Build & Deployment](#13-production-build--deployment)
14. [SEO & Meta Configuration](#14-seo--meta-configuration)
15. [Known Limitations (V1)](#15-known-limitations-v1)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Product Overview

**Smart AI Vision Trainer** is a browser-based SaaS fitness application that uses computer vision to track exercises in real-time. It leverages Google's MediaPipe Pose model to detect 33 body landmarks from a standard webcam, analyzes joint angles with biomechanical math, counts repetitions automatically, validates exercise form, and provides real-time voice coaching. The **AI video inference runs 100% client-side** (meaning your camera feed never leaves your device), while your completed workout statistics are securely synced to a Supabase backend to track long-term progress.

### Key Value Propositions

| Feature | Description |
|---------|-------------|
| **Zero-Latency AI** | MediaPipe WASM model runs locally at 30+ FPS — no server round-trips |
| **Privacy-First** | Video data never leaves the browser; no frames are uploaded anywhere |
| **No Hardware Required** | Works with any standard webcam or phone front camera |
| **Real Accountability** | Supabase backend persists workout history for long-term tracking |
| **Premium UX** | Dark neon HUD aesthetic with glassmorphism, scroll-reveal animations, and responsive design |

### What V1 Delivers

- ✅ 4 fully-tracked exercises with individual biomechanical counters
- ✅ Real-time pose skeleton overlay on camera feed
- ✅ Per-exercise form validation with audio + visual feedback
- ✅ Voice coaching via Web Speech Synthesis API
- ✅ Full authentication flow (sign up, sign in, sign out)
- ✅ Workout session persistence to PostgreSQL (Supabase)
- ✅ Workout history dashboard with per-session breakdown
- ✅ User profile with fitness summary and account management
- ✅ Dark/Light theme support with full token system
- ✅ 6-section animated marketing landing page
- ✅ Mobile-responsive layout with hamburger navigation
- ✅ SEO-optimized `index.html` with OG/Twitter meta tags

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Build Tool** | Vite | 7.3.1 | Lightning-fast HMR dev server + optimized production bundler |
| **Framework** | React | 19.2.0 | Component-based UI with hooks |
| **Language** | TypeScript | 5.9.3 | Static type safety across the entire codebase |
| **Routing** | React Router DOM | 7.13.2 | Client-side SPA navigation with protected routes |
| **ML Engine** | MediaPipe Pose | 0.5.x | 33-landmark 3D pose detection (WASM, loaded from CDN) |
| **Auth & DB** | Supabase | 2.101.1 | PostgreSQL database + JWT-based authentication |
| **Voice** | Web Speech API | Built-in | Browser-native text-to-speech for coaching cues |
| **Styling** | Vanilla CSS | — | Token-driven design system (no CSS frameworks) |
| **Linting** | ESLint | 9.39.1 | TypeScript-aware linting with React hooks plugin |

### Notable Architectural Decisions

1. **No CSS framework** — A hand-built token system (`theme.css`) provides complete control over aesthetics and theming without dependency bloat.
2. **MediaPipe from CDN** — The WASM model loads from `cdn.jsdelivr.net` to avoid bundling ~30 MB of model weights. Vite's `optimizeDeps.exclude` prevents its esbuild pre-bundler from breaking MediaPipe's hand-rolled WASM loaders.
3. **Canvas-based skeleton overlay** — The `PoseOverlay` component renders on a raw `<canvas>` element using `requestAnimationFrame` to avoid React re-render overhead during the per-frame drawing loop.
4. **Ref-based landmark storage** — Pose landmarks live in a `useRef` (not `useState`) to prevent re-rendering 30+ times per second. Only derived values like `reps` and `formStatus` trigger React state updates.

---

## 3. System Architecture

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (CLIENT-SIDE)                      │
│                                                                    │
│  ┌─────────┐     ┌──────────┐     ┌──────────────────────────┐   │
│  │ Webcam  │────▶│  <video> │────▶│ usePose() Hook           │   │
│  └─────────┘     └──────────┘     │  ┌──────────────────┐    │   │
│                                    │  │ MediaPipe Pose   │    │   │
│                                    │  │ (WASM engine)    │    │   │
│                                    │  └────────┬─────────┘    │   │
│                                    │           │ 33 landmarks │   │
│                                    │  ┌────────▼─────────┐    │   │
│                                    │  │ angleCalculator   │    │   │
│                                    │  └────────┬─────────┘    │   │
│                                    │           │ joint angles  │   │
│                                    │  ┌────────▼─────────┐    │   │
│                                    │  │ Exercise Counter  │    │   │
│                                    │  │ (pushup/squat/   │    │   │
│                                    │  │  curl/jumpjack)  │    │   │
│                                    │  └────────┬─────────┘    │   │
│                                    │           │ rep count     │   │
│                                    │  ┌────────▼─────────┐    │   │
│                                    │  │ formValidator     │    │   │
│                                    │  └────────┬─────────┘    │   │
│                                    │           │ GOOD/BAD     │   │
│                                    │  ┌────────▼─────────┐    │   │
│                                    │  │ voiceCoach        │    │   │
│                                    │  │ (Speech Synth)    │    │   │
│                                    │  └──────────────────┘    │   │
│                                    └──────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ UI Layer                                                    │   │
│  │  ├── PoseOverlay (canvas skeleton drawing)                 │   │
│  │  ├── HUD (reps, form status, exercise label)               │   │
│  │  ├── WorkoutTimer (RAF-based stopwatch)                    │   │
│  │  └── WorkoutSummary (post-session stats)                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌────────────────┐                                               │
│  │ workoutTracker  │──────────── on workout end ─────────────┐    │
│  └────────────────┘                                          │    │
│                                                               │    │
└───────────────────────────────────────────────────────────────┼────┘
                                                                │
                                            ┌───────────────────▼────┐
                                            │  SUPABASE (REMOTE)     │
                                            │  ├── Auth (JWT)        │
                                            │  ├── workout_sessions  │
                                            │  ├── exercise_sets     │
                                            │  └── profiles          │
                                            └────────────────────────┘
```

### Workout State Machine

The `/workout` page follows a deterministic state machine with no ambiguous transitions:

```
┌──────┐  Click "Start"  ┌──────────────────┐  Camera granted  ┌───────────────┐
│ idle │ ───────────────▶ │ requesting_camera │ ───────────────▶ │ loading_model │
└──────┘                  └──────────────────┘                  └───────┬───────┘
   ▲                                                                     │
   │ "New Workout"                                          Model ready  │
   │                                                                     ▼
┌──────────┐  End Workout  ┌─────────────────┐  3..2..1..GO  ┌───────────┐
│ completed│ ◀──────────── │ active_workout  │ ◀──────────── │ countdown │
└──────────┘               └────────┬────────┘               └───────────┘
                                    │ ▲
                            Pause   │ │  Resume
                                    ▼ │
                               ┌────────┐
                               │ paused │
                               └────────┘

Error state: Any stage can transition to 'error' on camera/model failure
```

### Provider Hierarchy (main.tsx)

```
<StrictMode>
  <AuthProvider>          ← Supabase auth session management
    <BrowserRouter>       ← React Router context
      <ThemeProvider>     ← Dark/Light theme state + localStorage persistence
        <App />           ← Router → Layout → Pages
      </ThemeProvider>
    </BrowserRouter>
  </AuthProvider>
</StrictMode>
```

---

## 4. Complete File Structure

```
smart-ai-vision-trainer/
├── index.html                         # Entry HTML with SEO meta, OG tags, custom favicon
├── package.json                       # Dependencies & scripts (dev, build, lint, preview)
├── vite.config.ts                     # Vite config: React plugin, MediaPipe exclusions, COOP/COEP headers
├── tsconfig.json                      # Root TypeScript config (references app + node configs)
├── tsconfig.app.json                  # App-level TS config (strict, JSX, bundler resolution)
├── tsconfig.node.json                 # Node-level TS config (for vite.config.ts)
├── eslint.config.js                   # ESLint flat config with React hooks + refresh rules
├── .env.example                       # Template for Supabase environment variables
├── .env.local                         # Actual Supabase credentials (gitignored)
├── .gitignore                         # Ignores node_modules, dist, *.local, IDE files
├── LICENSE                            # MIT License
├── README.md                          # Quick-start readme
│
├── documentation/                     # Project documentation
│   ├── ARCHITECTURE.md                # System architecture diagrams (Mermaid)
│   ├── BACKEND_PERSISTENCE_PHASE.md   # Phase 1 backend integration notes
│   ├── FILE_STRUCTURE.md              # Codebase file map
│   ├── PROJECT_OVERVIEW.md            # Project vision, roadmap, milestones
│   ├── UI_UX_PHASE.md                 # UI/UX development phase notes
│   └── V1_RELEASE.md                  # ★ This document
│
├── supabase/
│   └── schema.sql                     # Complete database schema with RLS policies
│
├── public/                            # Static assets served by Vite
│
└── src/
    ├── main.tsx                        # React DOM mount + provider hierarchy
    ├── App.tsx                         # Root component (renders Router)
    ├── App.css                         # Legacy layout styles (from early dev, mostly unused now)
    ├── Router.tsx                      # All route definitions + ProtectedRoute wrappers
    ├── index.css                       # Global resets, scrollbar, selection, base typography
    │
    ├── styles/
    │   ├── theme.css                   # **Design system Bible** — all CSS custom properties
    │   └── animations.css              # Global keyframe animations (fade, slide, pulse, float)
    │
    ├── context/
    │   ├── AuthContext.tsx             # Supabase session → React context bridge
    │   └── ThemeContext.tsx            # Dark/Light theme toggle + localStorage persistence
    │
    ├── lib/
    │   └── supabase.ts                # Supabase client singleton initialization
    │
    ├── types/
    │   ├── exercise.ts                # ExerciseType union + getExerciseLabel() helper
    │   └── pose.ts                    # Pose-related type definitions
    │
    ├── hooks/
    │   ├── usePose.ts                 # ★ Core hook: MediaPipe loading, RAF loop, exercise routing
    │   ├── useCamera.ts               # Camera utility hook (stub — logic is in CameraFeed)
    │   └── useInView.ts               # IntersectionObserver hook for scroll-reveal animations
    │
    ├── engine/
    │   ├── biomechanics/
    │   │   └── angleCalculator.ts     # 3D vector angle calculation (dot product, acos)
    │   ├── biomechanics.ts            # Re-export barrel
    │   ├── pushupCounter.ts           # Push-up state machine (UP ↔ DOWN via elbow angle)
    │   ├── squatCounter.ts            # Squat state machine (UP ↔ DOWN via knee angle)
    │   ├── curlCounter.ts             # Bicep curl state machine (UP ↔ DOWN via elbow angle)
    │   ├── jumpingJackCounter.ts      # Jumping jack detector (arms up + feet wide)
    │   ├── formValidator.ts           # Per-exercise biomechanical form checks
    │   ├── voiceCoach.ts              # Web Speech Synthesis wrapper with cooldown
    │   ├── workoutTracker.ts          # Session-level rep/form accumulator
    │   ├── poseProcessor.ts           # Re-export barrel
    │   └── repCounter.ts             # Re-export barrel
    │
    ├── services/
    │   └── workoutService.ts          # Supabase insert logic for completed workouts
    │
    ├── utils/
    │   ├── angleCalculator.ts         # Re-export barrel
    │   └── profileMath.ts            # Profile data aggregation (streak, totals)
    │
    ├── pages/
    │   ├── Home.tsx / Home.css         # Landing page (6 sections)
    │   ├── Auth.tsx / Auth.css         # Sign in / Sign up form
    │   ├── Workout.tsx / Workout.css   # Active workout experience
    │   ├── History.tsx / History.css   # Workout history dashboard
    │   ├── Profile.tsx / Profile.css   # User account & fitness summary
    │   └── Settings.tsx / Settings.css # Theme toggle + placeholder
    │
    ├── components/
    │   ├── Layout/
    │   │   ├── Layout.tsx / Layout.css # App shell (Navbar + Outlet + Footer)
    │   │   ├── Navbar.tsx / Navbar.css # Responsive nav with mobile drawer
    │   │   └── Footer.tsx / Footer.css # 3-column footer with links
    │   │
    │   ├── Camera/
    │   │   ├── CameraFeed.tsx          # Camera permission handling + usePose integration
    │   │   ├── CameraFeed.css          # Camera UI overlays, spinners, error states
    │   │   └── Camera.tsx              # Minimal wrapper (legacy)
    │   │
    │   ├── HUD/
    │   │   ├── HUD.tsx                 # Heads-up display: reps, form status, coaching cues
    │   │   └── HUD.css                 # Glassmorphic HUD styling
    │   │
    │   ├── PoseOverlay/
    │   │   └── PoseOverlay.tsx         # Canvas-rendered skeleton overlay (RAF-based)
    │   │
    │   ├── sections/                   # Landing page section components
    │   │   ├── Hero.tsx / Hero.css
    │   │   ├── LiveDemo.tsx / LiveDemo.css
    │   │   ├── AICoach.tsx / AICoach.css
    │   │   ├── FeaturesGrid.tsx / FeaturesGrid.css
    │   │   ├── ExercisesGrid.tsx / ExercisesGrid.css
    │   │   └── FinalCTA.tsx / FinalCTA.css
    │   │
    │   ├── ui/
    │   │   └── ScrollReveal.tsx        # IntersectionObserver animation wrapper
    │   │
    │   ├── ProtectedRoute.tsx          # Auth guard — redirects to /auth if not logged in
    │   ├── ThemeToggle.tsx             # Animated sun/moon theme switch button
    │   ├── ExerciseSelector.tsx        # Pill-button exercise chooser
    │   ├── WorkoutSummary.tsx          # Post-workout stats card
    │   ├── CountdownOverlay.tsx / .css # 3..2..1..GO! animation overlay
    │   └── WorkoutTimer.tsx / .css     # RAF-based stopwatch (HH:MM:SS)
    │
    └── assets/                         # Static imports (currently empty)
```

**Total file count**: ~65 source files  
**Production bundle**: 484 KB JS (gzip: 142 KB) + 57 KB CSS (gzip: 10 KB)

---

## 5. Core Features — Detailed Breakdown

### 5.1 AI Pose Detection Engine

**Location**: `src/hooks/usePose.ts`

The central hook that orchestrates everything. It:

1. **Dynamically imports** MediaPipe Pose via `import('@mediapipe/pose')` on mount
2. **Configures** the model with:
   - `modelComplexity: 1` (balanced accuracy/performance)
   - `smoothLandmarks: true` (reduces jitter)
   - `minDetectionConfidence: 0.5`
   - `minTrackingConfidence: 0.5`
3. **Runs a RAF detection loop** — on each animation frame, sends the video frame to MediaPipe via `pose.send({ image: video })`
4. **Routes landmarks** to the correct exercise counter based on `exerciseRef.current`
5. **Returns** to consumers:
   - `landmarks: RefObject<NormalizedLandmark[]>` — the raw 33 landmarks (ref, not state)
   - `reps: number` — current rep count
   - `formStatus: 'GOOD' | 'BAD'` — current form assessment
   - `modelState: 'idle' | 'loading' | 'ready' | 'error'` — model lifecycle state
   - `modelError: string | null` — human-readable error if model fails

**MediaPipe CDN source**: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/{file}`

### 5.2 Exercise Tracking (4 Exercises)

Each exercise has a dedicated state machine counter in `src/engine/`:

| Exercise | File | Detection Method | Key Angle/Signal |
|----------|------|-----------------|------------------|
| **Push-ups** | `pushupCounter.ts` | Elbow angle (shoulder→elbow→wrist) | UP: >160°, DOWN: <90° |
| **Squats** | `squatCounter.ts` | Knee angle (hip→knee→ankle) | UP: >160°, DOWN: <90° |
| **Bicep Curls** | `curlCounter.ts` | Elbow angle (shoulder→elbow→wrist) | UP: <40°, DOWN: >140° |
| **Jumping Jacks** | `jumpingJackCounter.ts` | Arms above shoulders + feet spread >0.25 | Boolean compound check |

**Angle Calculation** (`biomechanics/angleCalculator.ts`):
- Takes three 3D points (A, B, C) — A is proximal, B is vertex, C is distal
- Computes vectors BA and BC
- Calculates angle via `acos(dot(BA, BC) / (|BA| * |BC|))` with clamping for numerical safety
- Returns degrees (0–180)

**Exercise Type Definition** (`types/exercise.ts`):
```typescript
export type ExerciseType = 'PUSHUP' | 'SQUAT' | 'CURL' | 'JUMPING_JACK';
```

### 5.3 Form Validation System

**Location**: `src/engine/formValidator.ts`

Each exercise has a dedicated validator that checks biomechanical correctness:

| Exercise | What's Validated | Threshold | Signal |
|----------|-----------------|-----------|--------|
| **Push-up** | Shoulder–Hip–Knee alignment (straight back) | Hip angle ≥ 150° = GOOD | Detects sagging/piking hips |
| **Squat** | Shoulder–Hip–Knee angle (upright torso) | Hip angle ≥ 60° = GOOD | Detects excessive forward lean |
| **Bicep Curl** | Elbow lateral drift from shoulder | Drift ≤ 0.08 normalized = GOOD | Detects arm swinging |
| **Jumping Jack** | Wrists sufficiently above shoulders | ≥ 5% frame height above = GOOD | Detects partial arm raises |

**Design Principle**: If landmarks are missing or visibility is too low, the system returns `GOOD` — never penalizing users for brief camera occlusion.

### 5.4 Voice Coaching

**Location**: `src/engine/voiceCoach.ts`

- Uses the browser's native `SpeechSynthesis` API
- **Cooldown**: 2-second minimum gap between spoken messages to avoid overlap
- **Guard conditions**: Won't speak if synthesis is already active
- **Trigger points**:
  - On successful rep: exercise-specific praise (e.g., "Great push-up!")
  - On form deviation: correction cue (e.g., "Keep your back straight")
  - On workout start: "Workout started!"
  - On workout end: "Workout complete. Great job!"

### 5.5 Workout State Machine

**Location**: `src/pages/Workout.tsx`

The workout page implements a strict 7-state machine:

```typescript
type WorkoutState =
  | 'idle'               // Exercise selector UI shown
  | 'requesting_camera'  // Waiting for getUserMedia permission
  | 'loading_model'      // Camera granted, MediaPipe initializing
  | 'countdown'          // 3..2..1..GO! overlay
  | 'active_workout'     // Live tracking + timer running
  | 'paused'             // Timer paused, camera still active
  | 'completed'          // Session summary shown
  | 'error';             // Camera or model error state
```

**Key Guards**:
- Camera feed only mounts when state exits `idle/completed/error`
- Timer only renders during `active_workout` or `paused`
- End Workout button only shows during `active_workout` or `paused`
- Summary only renders when `completed` AND session data exists

### 5.6 Workout Persistence & History

**Save Flow** (`services/workoutService.ts`):

1. On workout end, `Workout.tsx` calls `saveWorkoutSession(session, user)`
2. Service inserts a row into `workout_sessions` with timestamps, rep counts
3. Service then inserts per-exercise breakdown rows into `exercise_sets`
4. **Partial failure handling**: If exercise_sets insert fails, the session row is already committed — caller gets `setsPartialFailure: true` instead of throwing

**History Page** (`pages/History.tsx`):
- Fetches all sessions with nested `exercise_sets` in one query via Supabase's relational syntax
- Displays date, duration, accuracy %, total reps, and per-exercise breakdown
- Shows empty state with CTA to start a workout when no history exists

---

## 6. Authentication & Database

### 6.1 Supabase Auth Flow

**Components involved**:
- `lib/supabase.ts` — Supabase client singleton
- `context/AuthContext.tsx` — React context providing `{ session, user, isLoading }`
- `pages/Auth.tsx` — Sign in / Sign up form
- `components/ProtectedRoute.tsx` — Auth guard

**Flow**:
```
User visits /workout (protected) 
  → ProtectedRoute checks useAuth().user
  → If null: redirect to /auth
  → If loading: show "Authenticating..." spinner
  → If logged in: render <Workout />

User submits Auth form
  → supabase.auth.signInWithPassword() or signUp()
  → AuthContext.onAuthStateChange fires
  → Context updates { session, user }
  → ProtectedRoute re-evaluates → renders protected content
```

**Graceful degradation**: The Supabase client (`lib/supabase.ts`) includes fallback logic — if env vars are missing, it initializes with placeholder values and logs a warning. The app won't crash, but auth features won't work.

### 6.2 Database Schema

**Location**: `supabase/schema.sql`

```sql
-- User profiles (auto-created on signup via trigger)
profiles
  ├── id (uuid, PK, FK → auth.users)
  ├── updated_at (timestamptz)
  └── member_since (timestamptz, default now())

-- Workout session records
workout_sessions
  ├── id (uuid, PK, auto-generated)
  ├── user_id (uuid, FK → auth.users, NOT NULL)
  ├── start_time (timestamptz, NOT NULL)
  ├── end_time (timestamptz, NOT NULL)
  ├── total_reps (integer, default 0)
  ├── good_reps (integer, default 0)
  └── bad_reps (integer, default 0)

-- Per-exercise breakdown within a session
exercise_sets
  ├── id (uuid, PK, auto-generated)
  ├── session_id (uuid, FK → workout_sessions, CASCADE)
  ├── user_id (uuid, FK → auth.users, CASCADE)
  ├── exercise_type (text, NOT NULL)   -- e.g., 'PUSHUP', 'SQUAT'
  └── reps (integer, default 0)
```

**Auto-profile creation**: A PostgreSQL trigger `on_auth_user_created` fires `AFTER INSERT ON auth.users` and automatically creates a matching `profiles` row.

### 6.3 Row Level Security (RLS)

All three tables have RLS enabled. Policies enforce that users can only access their own data:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own row only | — | Own row only | — |
| `workout_sessions` | Own rows | Own rows | — | Own rows |
| `exercise_sets` | Own rows | Own rows | — | Own rows |

Policy check: `auth.uid() = user_id` (or `auth.uid() = id` for profiles).

---

## 7. Pages & Routing

**Location**: `src/Router.tsx`

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | `Home` | Public | Marketing landing page with 6 sections |
| `/auth` | `Auth` | Public | Email/password sign in + sign up |
| `/workout` | `Workout` | 🔒 Protected | AI workout experience with camera |
| `/history` | `History` | 🔒 Protected | Past workout sessions list |
| `/profile` | `Profile` | 🔒 Protected | Account identity + fitness summary |
| `/settings` | `Settings` | 🔒 Protected | Theme toggle + placeholder for future settings |

All pages are wrapped in `<Layout />` which provides persistent `<Navbar />` and `<Footer />`.

Protected routes use `<ProtectedRoute>` which:
1. Shows a loading spinner while auth state initializes
2. Redirects to `/auth` if no user is logged in
3. Renders the child component if authenticated

---

## 8. Design System

### 8.1 Theme Architecture

**Location**: `src/styles/theme.css` (193 lines)

The entire visual identity is driven by CSS custom properties. Components never hardcode colors — they reference tokens like `var(--color-accent-primary)`.

Two theme variants are defined:
- `:root, [data-theme="dark"]` — Dark mode (default)
- `[data-theme="light"]` — Light mode

Theme persistence: `ThemeContext.tsx` saves the user's preference to `localStorage` under key `ai-vision-trainer-theme` and applies `data-theme` to `<html>`.

### 8.2 Color Palette

#### Dark Theme (Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#060918` | Page background |
| `--color-bg-secondary` | `#0c1029` | Card backgrounds |
| `--color-bg-glass` | `rgba(15,20,50,0.55)` | Glassmorphism panels |
| `--color-text-primary` | `#f0f2ff` | Headings, body text |
| `--color-text-secondary` | `#a0a8cc` | Descriptions, labels |
| `--color-accent-primary` | `#6c8eff` | Buttons, links, brand |
| `--color-accent-secondary` | `#a78bfa` | Hover states, gradients |
| `--color-neon-blue` | `#00b4ff` | Landing page neon accents |
| `--color-neon-cyan` | `#00e5ff` | Skeleton overlay, glow effects |
| `--color-neon-purple` | `#b14eff` | Gradient endpoints |
| `--color-success` | `#4ade80` | Good form indicators |
| `--color-error` | `#f97373` | Bad form / error states |
| `--color-warning` | `#fbbf24` | Loading states |

#### Core Gradients
| Token | Usage |
|-------|-------|
| `--gradient-brand` | Primary brand gradient (blue → purple) |
| `--gradient-neon` | Landing page neon sweep (blue → cyan → purple) |
| `--gradient-accent` | Success/CTA gradient (green) |
| `--gradient-hero` | Radial hero section background glow |

### 8.3 Typography & Spacing

**Font**: Inter (loaded from Google Fonts) with system-ui fallback chain.

**Type Scale**: 
```
--text-xs:   0.75rem  (12px)
--text-sm:   0.875rem (14px)
--text-base: 1rem     (16px)
--text-lg:   1.125rem (18px)
--text-xl:   1.25rem  (20px)
--text-2xl:  1.5rem   (24px)
--text-3xl:  1.875rem (30px)
--text-4xl:  2.25rem  (36px)
--text-5xl:  3rem     (48px)
--text-6xl:  3.75rem  (60px)
```

**Spacing Scale** (4px base):
```
--space-1:  4px  │  --space-6:  24px  │  --space-16: 64px
--space-2:  8px  │  --space-8:  32px  │  --space-20: 80px
--space-3: 12px  │  --space-10: 40px  │  --space-24: 96px
--space-4: 16px  │  --space-12: 48px
```

**Border Radius Scale**:
```
--radius-sm:   6px   │  --radius-xl:   24px
--radius-md:  10px   │  --radius-2xl:  32px
--radius-lg:  16px   │  --radius-full: 9999px
```

### 8.4 Animation System

**Location**: `src/styles/animations.css`

Global keyframe animations used across the app:

| Animation Class | Effect | Duration |
|----------------|--------|----------|
| `anim-fade-in` | Opacity 0 → 1 | 600ms |
| `anim-fade-in-up` | Slide up 20px + fade in | 600ms |
| `anim-scale-in` | Scale 0.95 → 1 + fade in | 400ms |
| `anim-pop-in` | Scale 0.8 → 1 with spring bounce | 500ms |
| `anim-pulse-glow` | Pulsing opacity for loading states | 2s infinite |
| `hover-lift` | Translatey -4px + enhanced shadow on hover | 250ms |
| `page-enter` | Page-level fade-in-up transition | 500ms |

**Scroll Reveal** (`ui/ScrollReveal.tsx`):
- Uses `IntersectionObserver` with `threshold: 0.1`
- Supports directional reveal: `up`, `left`, `right`
- Custom delay support via `delay` prop
- Elements start translated and transparent, animate to final position

---

## 9. Landing Page Sections

The home page is composed of 6 sequential scroll-revealing sections:

| # | Section | Component | Description |
|---|---------|-----------|-------------|
| 1 | **Hero** | `Hero.tsx` | Animated SVG pose skeleton, "Train With AI Precision" heading, stat pills (33 FPS, <50ms, 100% Client-side), CTA button |
| 2 | **Live Demo** | `LiveDemo.tsx` | Simulated HUD interface with animated rep counter, form feedback, timer, and exercise stats |
| 3 | **AI Coach** | `AICoach.tsx` | Cycling voice coach messages with animated waveform visualizer |
| 4 | **Features** | `FeaturesGrid.tsx` | 4-card grid: Pose Detection, Rep Counting, Form Correction, Voice Coaching |
| 5 | **Exercises** | `ExercisesGrid.tsx` | 4-card grid showing supported exercises with SVG icons and muscle groups |
| 6 | **Final CTA** | `FinalCTA.tsx` | "Ready to Train Smarter?" with gradient orb background and "Create Free Account" button |

---

## 10. Component Reference

### Camera System

| Component | Responsibility |
|-----------|---------------|
| `CameraFeed` | Manages `getUserMedia`, camera permissions (idle/requesting/granted/denied/unavailable), renders `<video>`, mounts `PoseOverlay` and `HUD`. Error messages resolve per DOMException type (NotAllowedError, NotFoundError, etc.) |
| `PoseOverlay` | Canvas element overlaying the video. Draws skeleton lines + joint dots using landmarks from `landmarksRef`. Mirrors X coordinates to match CSS `scaleX(-1)`. Reads CSS variables once at mount since Canvas API can't consume `var()`. |
| `HUD` | Heads-up display showing exercise name, rep count (with pulse animation on increment), form status (✔ Good / ✖ Fix form), and optional coaching cues per exercise phase. |

### Workout Flow Components

| Component | Responsibility |
|-----------|---------------|
| `ExerciseSelector` | Pill-button array for choosing exercise type. Renders 4 buttons with selected state via gradient background. |
| `CountdownOverlay` | Full-screen 3..2..1..GO! countdown with CSS animations. Calls `onComplete` when finished. |
| `WorkoutTimer` | `requestAnimationFrame`-based stopwatch that bypasses React state for the clock tick, updating DOM directly for performance. Supports pause/resume. |
| `WorkoutSummary` | Post-session stats card showing total reps, good/bad form counts, accuracy %, duration, and per-exercise breakdown. |

### Layout Components

| Component | Responsibility |
|-----------|---------------|
| `Layout` | App shell wrapping `<Navbar />`, `<Outlet />`, and `<Footer />`. |
| `Navbar` | Responsive nav with desktop links + mobile hamburger drawer. Logo matches the favicon SVG. Active link highlighting via `NavLink`. |
| `Footer` | 3-column layout: Brand + tagline, Navigation links, Feature list. Auto-updates copyright year. |

### Utility Components

| Component | Responsibility |
|-----------|---------------|
| `ProtectedRoute` | Auth guard HOC. Shows loading spinner → redirects to `/auth` → or renders children. |
| `ThemeToggle` | Animated sun ↔ moon toggle button that calls `toggleTheme()` from `ThemeContext`. |
| `ScrollReveal` | `IntersectionObserver` wrapper that adds directional reveal animations to child elements on scroll. |

---

## 11. Environment Variables

**File**: `.env.local` (created from `.env.example`, gitignored via `*.local` pattern)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL (e.g., `https://abc123.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public API key |

**Fallback behavior**: If these are missing, the Supabase client initializes with placeholder values. The app won't crash, but authentication and data persistence will not function.

---

## 12. Local Development Setup

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Supabase project** (free tier is sufficient)
- A device with a **webcam** (for testing the workout feature)
- A **modern browser** (Chrome, Edge, Firefox — Safari has limited MediaPipe support)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/anchitgupta/smart-ai-vision-trainer.git
cd smart-ai-vision-trainer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Supabase URL and anon key

# 4. Set up the database
# Go to your Supabase Dashboard → SQL Editor
# Paste the contents of supabase/schema.sql and run it

# 5. Start the development server
npm run dev
# Opens at http://localhost:5173
```

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `tsc -b && vite build` | TypeScript check + production bundle |
| `lint` | `eslint .` | Run ESLint across the codebase |
| `preview` | `vite preview` | Serve the production build locally |

---

## 13. Production Build & Deployment

### Build Output

```bash
npm run build
# Output:
# dist/index.html           2.58 KB (gzip: 1.02 KB)
# dist/assets/index-*.css   57.26 KB (gzip: 10.20 KB)
# dist/assets/pose-*.js     47.08 KB (gzip: 17.56 KB)   ← MediaPipe chunk
# dist/assets/index-*.js   483.33 KB (gzip: 141.98 KB)  ← Main app bundle
# Built in ~1s
```

### Deployment Platforms

The app is a static SPA — it can be deployed to any static hosting platform:

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

Add environment variables in the Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Optional**: Create a `vercel.json` for COOP/COEP headers:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

#### Netlify
```bash
npm run build
# Deploy the dist/ folder
```

Create `public/_headers`:
```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

#### Important Deployment Notes

1. **SPA Routing**: Configure your hosting platform to redirect all routes to `index.html` (Vercel does this automatically for SPAs).
2. **COOP/COEP Headers**: These are configured in `vite.config.ts` for the dev server only. For production, you need to configure them on your hosting platform. They enable `SharedArrayBuffer` which MediaPipe's SIMD WASM binary uses for optimal performance.
3. **Supabase Auth Redirect URLs**: In your Supabase project settings → Authentication → URL Configuration, add your production domain as an allowed redirect URL.
4. **HTTPS Required**: Camera access (`getUserMedia`) only works over HTTPS or localhost.

---

## 14. SEO & Meta Configuration

**Location**: `index.html`

The production `index.html` includes:

| Meta Tag | Value |
|----------|-------|
| `<title>` | AI Vision Trainer — Real-Time AI Fitness Coach |
| `meta[description]` | Train smarter with AI-powered real-time pose detection, automatic rep counting, and instant form correction — all running privately in your browser. |
| `meta[keywords]` | AI fitness, pose detection, workout tracker, form correction, MediaPipe, exercise counter |
| `meta[theme-color]` | `#060918` (dark theme primary) |
| `og:type` | website |
| `og:title` | AI Vision Trainer — Real-Time AI Fitness Coach |
| `og:description` | Real-time pose detection, smart rep counting, and instant form correction — all running privately in your browser. |
| `twitter:card` | summary_large_image |
| Favicon | Inline SVG data URI matching the navbar logo (gradient blue→purple pose figure) |

---

## 15. Known Limitations (V1)

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| **4 exercises only** | Users expecting Plank/Lunges/Yoga will be disappointed | Landing page accurately reflects available exercises |
| **Binary form feedback** | Only GOOD/BAD — no gradient scoring (e.g., 85% form) | Voice coach provides specific cues |
| **No password reset** | Users can't recover accounts if they forget password | Can be added via Supabase auth UI |
| **No auto-exercise detection** | User must manually select exercise before starting | Future roadmap item |
| **Safari limitations** | MediaPipe WASM has inconsistent support on Safari/iOS | Works reliably on Chrome, Edge, Firefox |
| **No offline support** | Requires internet for MediaPipe CDN + Supabase | MediaPipe could be bundled locally |
| **No social auth** | Only email/password — no Google/GitHub OAuth | Supabase supports it; just needs UI |
| **Settings page** | Only theme toggle — placeholder for future settings | Marked as "More Coming Soon" |
| **Mobile camera aspect ratio** | Portrait video on mobile may have unusual dimensions | CSS object-fit handles most cases |
| **No workout editing/deletion** | Users can't delete individual history entries from the UI | Data can be managed via Supabase dashboard |

---

## 16. Future Roadmap

### Phase 2: Expanding AI Capability 🧠
- [ ] Auto-detection mode (identify exercise without manual selection)
- [ ] 0–100% rep quality scoring (replacing binary GOOD/BAD)
- [ ] Additional exercises: Plank (endurance), Lunges, Yoga poses
- [ ] Multi-angle support for more accurate form detection

### Phase 3: Gamification & Engagement 🎮
- [ ] XP and leveling system for consistent training
- [ ] Daily streaks with visual rewards
- [ ] Achievement badges (first 100 reps, 7-day streak, etc.)
- [ ] Workout music with automatic ducking during voice cues

### Phase 4: Monetization (SaaS) 💳
- [ ] Stripe billing integration
- [ ] Free tier: 10 min/day, basic stats, 4 exercises
- [ ] Pro tier: Unlimited tracking, advanced analytics, premium exercises, custom routines

### Phase 5: Mobile PWA & Performance ⚡
- [ ] Service worker for offline-capable PWA
- [ ] Home screen installation support
- [ ] Lazy-loaded workout route (code splitting for faster landing page load)
- [ ] MediaPipe model self-hosting (eliminate CDN dependency)

### Phase 6: Social & Community 👥
- [ ] Shareable workout summaries
- [ ] Leaderboards
- [ ] Training challenges

---

## Document Revision History

| Date | Version | Changes |
|------|---------|---------|
| April 8, 2026 | 1.0.0 | Initial V1 release documentation |

---

*This document serves as the complete technical reference for the Smart AI Vision Trainer V1 release. For architecture diagrams, see `ARCHITECTURE.md`. For development phase notes, see `UI_UX_PHASE.md` and `BACKEND_PERSISTENCE_PHASE.md`.*
