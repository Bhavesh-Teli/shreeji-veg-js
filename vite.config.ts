import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['active-civet-deadly.ngrok-free.app'],
    // other options like port, proxy, etc.
  },
  plugins: [
    tailwindcss(),
    react()
  ],
})
