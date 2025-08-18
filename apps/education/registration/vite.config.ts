import fs from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
// import qiankun from 'vite-plugin-qiankun-lite';
import qiankun from 'vite-plugin-qiankun-x';
import tsconfigPaths from 'vite-tsconfig-paths';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const name = packageJson.name;

// https://vite.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['app-template.127.0.0.1.nip.io'],
    port: 51733,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:30000',
        changeOrigin: true,
      },
    },
    cors: true,
  },
  build: {
    outDir: 'dist/static',
  },
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    tsconfigPaths(),
    react(),
    // qiankun({ name, sandbox: true }),
    qiankun('voltade-education-registration'),
    tailwindcss(),
  ],
});
