import tanstackRouter from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      '127.0.0.1.nip.io',
      'socat',
      'socat.platform',
      'socat.platform.svc.cluster.local',
    ],
    open: 'http://127.0.0.1.nip.io',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['data/**/*'],
    },
  },
  build: {
    outDir: 'dist/static',
  },
  plugins: [
    tanstackRouter({ autoCodeSplitting: true, target: 'react' }),
    tsconfigPaths(),
    react(),
  ],
});
