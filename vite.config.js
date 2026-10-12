import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset URLs support both a project page and a custom domain.
export default defineConfig({ plugins: [react()], base: './' })
