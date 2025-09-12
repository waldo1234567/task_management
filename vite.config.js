import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  define: {
    // some libs expect `global` to exist (sockjs-client). Map it to window for browser builds.
    global: 'window'
  },
})
