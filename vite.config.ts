import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/pdm-api': {
        target: 'https://projetos.codata.prefeitura.sp.gov.br',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/pdm-api/, ''),
      },
    },
  },
})
