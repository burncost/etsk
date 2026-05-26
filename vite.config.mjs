import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'dist', // ← ensure Vercel knows the build folder
    chunkSizeWarningLimit: 1000,
  },
});
