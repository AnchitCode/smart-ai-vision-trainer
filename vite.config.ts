import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    // MediaPipe ships hand-rolled WASM loaders that Vite's esbuild pre-bundler
    // breaks by renaming the `arguments` identifier. Exclude them entirely so
    // Vite serves the files as-is from node_modules.
    exclude: [
      '@mediapipe/pose',
      '@mediapipe/camera_utils',
      '@mediapipe/drawing_utils',
    ],
  },

  server: {
    headers: {
      // Required for SharedArrayBuffer used by MediaPipe SIMD WASM binary
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})

