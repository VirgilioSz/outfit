import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: { port: 5173, open: true },
  build: {
    outDir: '../dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        index: 'index.html',
        closet: 'closet.html',
        upload: 'upload.html',
        generate: 'generate.html',
        history: 'history.html'
      }
    }
  }
});