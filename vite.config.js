import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/eai-codenames--1-/', // MUITO IMPORTANTE: Mude para o nome do seu repositório
})
