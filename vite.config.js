import { defineConfig } from 'vite';

// Production build is intended for GitHub Pages at https://<user>.github.io/Fistuk/,
// so assets resolve from the "/Fistuk/" sub-path. Dev serves from root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Fistuk/' : '/',
  server: { host: true, port: 5174 },
  build: { target: 'es2020', outDir: 'dist', assetsInlineLimit: 0 },
}));
