import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002, // Port fixe pour CRM
    strictPort: true, // Échouer si le port est occupé
  },
})
