<<<<<<< HEAD
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
>>>>>>> origin/backend

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
>>>>>>> origin/backend
})
