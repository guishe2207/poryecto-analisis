import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeBasePath(basePath = '/') {
  if (!basePath || basePath === '/') return '/'

  const trimmed = basePath.replace(/^\/+|\/+$/g, '')
  return `/${trimmed}/`
}

export default defineConfig({
  plugins: [react()],
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
})
