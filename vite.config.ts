import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'lib/index.ts'),
          name: 'Gridsmith',
          formats: ['es', 'cjs'],
          fileName: (fmt) => `gridsmith.${fmt === 'es' ? 'esm' : fmt}.js`,
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: { react: 'React', 'react-dom': 'ReactDOM' },
          },
        },
        outDir: 'dist-lib',
      },
    }
  }

  return {
    plugins: [react(), tailwindcss()],
  }
})
