import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: './src/css-entry.js',
      output: {
        assetFileNames: 'tailwind.css',
        dir: './dist/styles',
        entryFileNames: '[name].js' // We'll delete this afterwards
      }
    },
    emptyOutDir: false
  }
})