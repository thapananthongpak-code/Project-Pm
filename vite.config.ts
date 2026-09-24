import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // ใช้ path แบบ relative ให้เปิดได้ทั้ง localhost และ GitHub Pages (/Project-Pm/)
  base: './',
  plugins: [react(), tailwindcss()],
})
