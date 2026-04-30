# 🏋️ Smart AI Vision Trainer

**Smart AI Vision Trainer** is a futuristic, browser-based AI fitness application that democratizes access to personal training. It uses a standard webcam and Google's MediaPipe Pose model to **detect body movements in real-time**, count exercise repetitions, validate form correctness, and provide intelligent voice coaching — all running **100% client-side** with zero backend latency.

## 🚀 Features
- **Zero-Latency AI Tracking**: Client-side execution of Google's MediaPipe framework for real-time 3D pose estimation.
- **Form Validation & Coaching**: Intelligent voice feedback alerting users to correct depth and angles based on active biomechanical math.
- **Premium SaaS UI**: Glassmorphism and Neon tokens providing a highly polished, interactive Dark HUD.
- **User Persistence**: Integrated Supabase Auth & PostgreSQL database to securely save user workout history and statistics.
- **Privacy First**: Video data never leaves the user's browser. Everything is computed locally.

## 🧱 Tech Stack
- **Frontend**: React 19, TypeScript, React Router
- **Machine Learning**: MediaPipe Pose (WASM)
- **Styling**: Vanilla CSS with strict variable design system
- **Backend & Auth**: Supabase
- **Build Tool**: Vite

## 🏎️ Getting Started Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/anchitgupta/smart-ai-vision-trainer.git
   cd smart-ai-vision-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy the example environment file and fill in your Supabase credentials.
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure you never commit your actual `.env.local` to version control!)*

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

## 📜 License
Distributed under the MIT License.
