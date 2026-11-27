import { VitePWA } from 'vite-plugin-pwa';
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-sindicat.svg'],
      manifest: {
        name: 'SindiCat · Gestión de Colonias Felinas',
        short_name: 'SindiCat',
        description: 'PWA privada para gestión de colonias felinas, censo, CER e historial veterinario.',
        theme_color: '#2E6F5E',
        background_color: '#F4F7F5',
        display: 'standalone',
        lang: 'es',
        icons: [
          {
            src: 'icon-sindicat.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});