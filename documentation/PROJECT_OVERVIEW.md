# 🏋️ Smart AI Vision Trainer — Project Documentation

> **Status**: MVP In Progress | **Stack**: Vite + React 19 + TypeScript + MediaPipe Pose  
> **Last updated**: April 1, 2026

---

## 🎯 What Is This Project?

**Smart AI Vision Trainer** is a browser-based AI fitness application that uses your webcam and Google's MediaPipe Pose model to **detect body movements in real-time**, count exercise repetitions, validate form, and provide voice coaching — all running **100% client-side** with zero backend required.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Build Tool** | Vite 7.3 |
| **UI Framework** | React 19.2 + TypeScript 5.9 |
| **Pose Detection** | MediaPipe Pose 0.5 (WASM, loaded via CDN) |
| **Voice Coaching** | Web Speech Synthesis API |
| **Styling** | Vanilla CSS + Inline React styles |
| **Linting** | ESLint 9 with TypeScript & React plugins |

---

## 📁 Project Structure

```
smart-ai-vision-trainer/
├── index.html                # Entry HTML (Vite SPA)
├── vite.config.ts            # Vite config (MediaPipe WASM workarounds, CORS headers)
├── package.json              # Dependencies & scripts
├── src/
│   ├── main.tsx              # React root mount
│   ├── App.tsx               # Main app shell (exercise selector, camera, workout flow)
│   ├── App.css               # Global app styles
│   ├── index.css             # CSS reset & base styles
│   │
│   ├── components/
│   │   ├── Camera/
│   │   │   ├── Camera.tsx         # Re-export barrel
│   │   │   └── CameraFeed.tsx     # 🎥 Camera access, permission handling, integrates pose + overlay + HUD
│   │   ├── PoseOverlay/
│   │   │   └── PoseOverlay.tsx    # 🦴 Canvas-based skeleton overlay (33 keypoints + connections)
│   │   ├── HUD/
│   │   │   └── HUD.tsx            # 📊 Heads-up display (exercise name, rep count, form status)
│   │   ├── ExerciseSelector.tsx   # 🏷️ Pill-button exercise picker (4 exercises)
│   │   └── WorkoutSummary.tsx     # 📋 Post-workout stats card
│   │
│   ├── engine/
│   │   ├── biomechanics/
│   │   │   └── angleCalculator.ts # 📐 3D joint angle calculation (dot product method)
│   │   ├── pushupCounter.ts       # State machine: UP ↔ DOWN (elbow angle)
│   │   ├── squatCounter.ts        # State machine: UP ↔ DOWN (knee angle)
│   │   ├── curlCounter.ts         # State machine: DOWN ↔ UP (elbow angle)
│   │   ├── jumpingJackCounter.ts  # State machine: CLOSED ↔ OPEN (arms + feet position)
│   │   ├── formValidator.ts       # Push-up form check (shoulder-hip-knee alignment)
│   │   ├── voiceCoach.ts          # Text-to-speech with 2s cooldown
│   │   └── workoutTracker.ts      # Session tracking (reps, form, timing, per-exercise breakdown)
│   │
│   ├── hooks/
│   │   ├── usePose.ts             # 🧠 Core hook: MediaPipe init, frame loop, exercise dispatch
│   │   └── useCamera.ts           # Placeholder (camera logic lives in CameraFeed)
│   │
│   ├── types/
│   │   ├── exercise.ts            # ExerciseType union + label helper
│   │   └── pose.ts                # Empty placeholder
│   │
│   ├── pages/
│   │   └── Workout.tsx            # Placeholder page component
│   │
│   └── utils/
│       └── angleCalculator.ts     # Empty placeholder (real impl in engine/biomechanics/)
│
└── documentation/                 # 📚 You are here
```

---

## ✅ Features Developed So Far

### 1. 🎥 Camera System (`CameraFeed.tsx`)
- **Permission handling** with 5 states: `idle → requesting → granted / denied / unavailable`
- User-friendly **error messages** for every `DOMException` type
- Automatic stream cleanup on unmount
- Retry button on permission denial
- Mirrored video feed (selfie-mode) by default

### 2. 🧠 Pose Detection Engine (`usePose.ts` + MediaPipe)
- Loads **MediaPipe Pose** model dynamically via CDN
- Processes video frames via `requestAnimationFrame` loop
- Extracts **33 body landmarks** with 3D coordinates
- Configurable model complexity, detection/tracking confidence
- Graceful cleanup (closes MediaPipe instance on unmount)

### 3. 🦴 Skeleton Overlay (`PoseOverlay.tsx`)
- Renders **33 keypoints** as colored dots on a `<canvas>`
- Draws **16 skeletal connections** (torso, arms, legs)
- Mirrors X-coordinates to match flipped video feed
- Runs on its own `requestAnimationFrame` loop (decoupled from React renders)
- Visibility filtering (hides low-confidence landmarks)

### 4. 🏋️ Exercise Rep Counting (4 Exercises)

| Exercise | Detection Method | State Machine |
|----------|-----------------|---------------|
| **Push-ups** | Elbow angle (shoulder-elbow-wrist) | UP ↔ DOWN (110° / 140°) |
| **Squats** | Knee angle (hip-knee-ankle) | UP ↔ DOWN (90° / 160°) |
| **Bicep Curls** | Elbow angle (shoulder-elbow-wrist) | DOWN ↔ UP (160° / 45°) |
| **Jumping Jacks** | Arms position + feet distance | CLOSED ↔ OPEN |

### 5. 📐 Biomechanics Engine (`angleCalculator.ts`)
- Calculates **3D joint angles** using vector dot product
- Supports optional Z-axis for depth-aware calculations
- Input clamping to prevent `NaN` from floating-point errors

### 6. ✔️ Form Validation (`formValidator.ts`)
- Currently implemented for **push-ups only**
- Checks shoulder-hip-knee alignment (hip angle ≥ 150° = good form)
- Real-time GOOD/BAD status feedback

### 7. 🗣️ Voice Coach (`voiceCoach.ts`)
- Uses **Web Speech Synthesis API** for spoken feedback
- 2-second cooldown to prevent overlapping speech
- Context-aware messages:
  - Rep completion: "Great push-up!", "Nice squat!", etc.
  - Form correction: "Keep your back straight"

### 8. 📊 Workout Tracking (`workoutTracker.ts`)
- Tracks full session: total reps, good/bad form reps, duration
- Per-exercise rep breakdown
- Start/end workout lifecycle management
- Auto-start on first rep if not explicitly started

### 9. 📋 Workout Summary (`WorkoutSummary.tsx`)
- Post-workout stats card with glassmorphism design
- Shows: total reps, good/bad form, accuracy %, duration
- Per-exercise rep breakdown table

### 10. 🏷️ Exercise Selector (`ExerciseSelector.tsx`)
- Pill-button UI for switching between 4 exercises
- Gradient highlight on selected exercise
- Resets counters on exercise change

### 11. 📊 HUD (`HUD.tsx`)
- Floating heads-up display overlay on video
- Shows: current exercise, rep count, form status (✔ Good / ✖ Bad)
- Glassmorphism styling with backdrop blur

---

## 🔧 Vite Configuration Highlights

- **MediaPipe excluded from pre-bundling** (`optimizeDeps.exclude`) — Vite's esbuild breaks MediaPipe's WASM loaders
- **CORS headers** for `SharedArrayBuffer` support (`Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`)

---

## 📋 Placeholder Files (Not Yet Implemented)

| File | Purpose |
|------|---------|
| `hooks/useCamera.ts` | Planned custom hook for camera management |
| `types/pose.ts` | Planned pose-related type definitions |
| `utils/angleCalculator.ts` | Planned utility (real implementation exists in `engine/biomechanics/`) |
| `engine/biomechanics.ts` | Planned biomechanics barrel export |
| `engine/poseProcessor.ts` | Planned pose processing pipeline |
| `engine/repCounter.ts` | Planned generic rep counter (exercise-specific ones already exist) |
| `pages/Workout.tsx` | Placeholder workout page |

---

## 🚀 Potential Next Steps

Here are the areas to discuss for continued development:

### 📱 UI/UX Enhancements
- [ ] **Landing page** with hero section and feature showcase
- [ ] **Routing** (React Router) — Home, Workout, History, Settings
- [ ] **Responsive design** — mobile-friendly layout
- [ ] **Dark/light theme** toggle
- [ ] **Animated transitions** between app states
- [ ] **Timer/stopwatch** during workout

### 🧠 AI & Detection
- [ ] **Form validation for all exercises** (currently only push-ups)
- [ ] **Accuracy scoring per rep** (angle precision tracking)
- [ ] **Exercise auto-detection** (detect which exercise based on pose)
- [ ] **Difficulty levels** with adjustable angle thresholds
- [ ] **Calorie estimation** based on exercise type and reps

### 💾 Data & Backend
- [ ] **Workout history** — save sessions to localStorage or a backend
- [ ] **User accounts** — authentication (Firebase/Supabase)
- [ ] **Progress tracking** — charts & trends over time
- [ ] **Export workout data** (CSV/PDF)
- [ ] **Database** for persistent storage

### 🎮 Gamification
- [ ] **Challenges & goals** — daily/weekly targets
- [ ] **Badges & achievements**
- [ ] **Leaderboard** (multiplayer/social features)
- [ ] **Streak tracking**

### 🔊 Coaching
- [ ] **Custom workout plans** — timed exercise sequences
- [ ] **Warm-up / cool-down** guided routines
- [ ] **Rest timer** between sets
- [ ] **Adjustable voice coach** (speed, volume, personality)

### 🔒 Production Readiness
- [ ] **Unit tests** for engine modules
- [ ] **Error boundaries** for React components
- [ ] **Loading/splash screen** during model initialization
- [ ] **PWA support** — offline capability
- [ ] **Analytics** & performance monitoring
- [ ] **SEO optimization**

---

## 🏃 How to Run

```bash
cd smart-ai-vision-trainer
npm install
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`). Allow camera access when prompted.

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `@mediapipe/pose` | Pose estimation model (33 landmarks) |
| `@mediapipe/camera_utils` | Camera utilities for MediaPipe |
| `@mediapipe/drawing_utils` | Drawing utilities (not actively used) |
| `react` / `react-dom` | UI framework |
| `vite` / `@vitejs/plugin-react` | Build tooling |
| `typescript` | Type safety |

