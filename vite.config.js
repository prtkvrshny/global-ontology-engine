import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import gdeltEventsPlugin from './src/server/gdeltEventsPlugin.js'

export default defineConfig({
  plugins: [
    react(),
    gdeltEventsPlugin()
  ],
})
