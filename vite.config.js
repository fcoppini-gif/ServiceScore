import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configurazione per Vite con supporto a React e Tailwind v4
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})