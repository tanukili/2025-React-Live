import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/2025-React-Live/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
