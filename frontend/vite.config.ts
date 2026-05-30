import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const HTML_DEFAULTS: Record<string, string> = {
  VITE_APP_TITLE:      'Hikma - Copa do Mundo 2026',
  VITE_APP_SHORT_NAME: 'Hikma ⚽',
  VITE_THEME_COLOR:    '#e63329',
  VITE_APP_MANIFEST:   'manifest.json',
  VITE_APP_ICON_SVG:   'icon.svg',
  VITE_APP_ICON_192:   'icon-192x192.png',
  VITE_APP_TOUCH_ICON: 'apple-touch-icon.png',
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      {
        // Fill %VITE_*% placeholders in index.html using env vars or Hikma defaults
        name: 'html-env-defaults',
        transformIndexHtml(html) {
          return html.replace(/%VITE_([^%]+)%/g, (match, key) => {
            const full = `VITE_${key}`;
            return env[full] ?? HTML_DEFAULTS[full] ?? match;
          });
        },
      },
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
