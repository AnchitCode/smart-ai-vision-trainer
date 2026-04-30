# 📁 Project File & Folder Structure

This document provides a comprehensive mapping of the **Smart AI Vision Trainer** codebase, explicitly breaking down the `/src` directory to show how the UI, AI Engine, and Backend Data flows connect across standard functional domains.

---

## 1. 🏁 Entry Point & Configuration
*The root configuration files bounding the React lifecycle.*

- `src/main.tsx` — The primary React DOM mounting mechanism.
- `src/App.tsx` & `src/App.css` — The root component wrapping Context Providers onto the Router.
- `src/Router.tsx` — Manages URL layouts (`/`, `/workout`, `/profile`), defining which paths are encapsulated by `<ProtectedRoute>`.
- `src/index.css` — Global CSS resets and viewport lock parameters.

---

## 2. 🧠 The "AI Brain" (Core Engine)
*Located in `src/engine/`. This handles all device-side machine learning and spatial math.*

- **`poseProcessor.ts`** — Receives normalized landmarks from MediaPipe and routes them to specific calculators.
- **`biomechanics.ts` & `angleCalculator.ts`** — The vector mathematics system computing 3D spatial alignment (e.g., knee hinging arcs, shoulder alignments).
- **Exercise Counters (`squatCounter.ts`, `pushupCounter.ts`, `curlCounter.ts`, `jumpingJackCounter.ts`)** — Distinct, strict State Machines that determine if a user has hit eccentric depth and returned to a concentric peak.
- **`formValidator.ts`** — Tracks alignment logic across vectors (like checking a straight back during a squat) to feed error corrections.
- **`voiceCoach.ts`** — The Web Speech Synthesis API abstraction that queues and speaks "Good" / "Go deeper" coaching prompts.
- **`workoutTracker.ts`** — Master observer that orchestrates what counters should execute depending on user selection.

---

## 3. 🖼️ Pages (Views)
*Located in `src/pages/`. These combine structural components into complete routing views.*

- **`Home.tsx` (`.css`)** — The scrollable, 6-section neon marketing landing page.
- **`Auth.tsx` (`.css`)** — Supabase authenticated login/register portal utilizing seamless auth handlers.
- **`Workout.tsx` (`.css`)** — The most robust functional page. Hosts the `<CameraFeed>`, `<PoseOverlay>`, and `<HUD>`. Triggers the `stopwatch` routines and orchestrates camera permissions.
- **`Profile.tsx` (`.css`)** — Minimalist, responsive Account settings view implementing the 2-column detailed SaaS identity layout and pulling live "total sessions" aggregates.
- **`History.tsx` (`.css`) & `Settings.tsx` (`.css`)** — Reserved tracking history dashboards and localized configuration hubs.

---

## 4. 🧩 Components
*Located in `src/components/`. Broken heavily into domains of function.*

### Core Utilities
- **`Camera/CameraFeed.tsx`** — Hooks standard `navigator.mediaDevices` stream into a `<video>` tag safely.
- **`HUD/HUD.tsx`** — (Heads Up Display) — The interactive UI wrapping the active exercise counting logic block.
- **`PoseOverlay/PoseOverlay.tsx`** — Connects directly to the WASM coordinates, generating the native `<svg>` mesh layout drawn atop the user.

### Viewport Wrappers
- **`Layout/` (`Navbar.tsx`, `Footer.tsx`, `Layout.tsx`)** — Reusable, responsive app shell enforcing structural navigation constraints cross-app.
- **`ProtectedRoute.tsx`** — Validates `useAuth()` contexts before granting component mounting access.

### Sections (Landing Page)
- **`sections/`** — Modulated chunks of the Home page (`Hero`, `FinalCTA`, `LiveDemo`, `AICoach`, `FeaturesGrid`, `ExercisesGrid`).
- **`ui/ScrollReveal.tsx`** — An `IntersectionObserver` wrapper that fades elements in smoothly as users slide down the landing page.

### Modals / Overlays
- **`CountdownOverlay.tsx`** — Handles the 3..2..1 go sequence bridging workout setup to active recording.
- **`WorkoutTimer.tsx`** — Independent clock component avoiding heavy UI re-renders while tracking active duration.

---

## 5. 🔌 Webhooks, APIs, & Providers
*Located across `src/hooks`, `src/lib`, `src/services`, and `src/context`.*

- **Auth Layer**
  - `src/lib/supabase.ts` — The foundational initialization of the remote backend config.
  - `src/context/AuthContext.tsx` — A React Context pipeline broadcasting `<Session>` changes natively to the application.
- **Services**
  - `src/services/workoutService.ts` — API abstraction that bundles `Workout Tracker` data and fires `insert()` RPC calls to the PostgreSQL servers when a workout terminates.
- **Theme**
  - `src/context/ThemeContext.tsx` & `ThemeToggle.tsx` — DOM modifiers altering standard `[data-theme]` tags between Light and Dark mode states natively.
- **Custom React Hooks**
  - `src/hooks/usePose.ts` — Asynchronously loads the massive MediaPipe bundle securely and maintains the requestAnimationFrame data extraction loop.

---

## 6. 🎨 Design Systems & Styles
*Located in `src/styles/` or paired sequentially with items.*

- **`theme.css`** — The global "Bible" of CSS token variables establishing the `--color-neon-blue`, padding standards, glassmorphism boundaries, and strict breakpoints.
- **`animations.css`** — Hosts global keyframes (`anim-fade-in-up`, `pulse-glow`, `float`) standardizing transitions avoiding redundant CSS.

---

## 7. 📏 Types & Generics
*Strictly enforces structural integrity spanning multiple features.*

- `src/types/pose.ts` & `src/types/exercise.ts` — Defining object abstractions, e.g. `{ keypoints: Landmark3D[], currentReps: number }` across standard TypeScript files ensuring the engine and the HUD communicate flawlessly.
- `src/utils/profileMath.ts` — Data transformation logic aggregating lifetime data.
