import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // ffmpeg.wasm은 ESM 전용이므로 pre-bundle 제외
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})
