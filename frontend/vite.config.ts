import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: {
    // Disable TypeScript checking in production builds
    ...(mode === 'production' && {
      ignoreAnnotations: true,
      legalComments: 'none',
    }),
  },
  build: {
    ...(mode === 'production' && {
      // Disable minification to avoid potential issues
      minify: 'esbuild',
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress specific warnings that might cause build failures
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
          if (warning.code === 'CIRCULAR_DEPENDENCY') return
          warn(warning)
        },
      },
    }),
  },
}))