import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/noor/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          { urlPattern: /equran\.id\/api\/v2\/surat\/\d+/, handler: 'CacheFirst', options: { cacheName: 'quran-surah-cache' } },
          { urlPattern: /aladhan\.com\/v1\/timings/, handler: 'NetworkFirst', options: { cacheName: 'prayer-times-cache' } },
        ]
      },
      manifest: {
        name: 'Noor \u2014 Muslim Companion',
        short_name: 'Noor',
        theme_color: '#1a2b1c',
        background_color: '#0f1710',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
