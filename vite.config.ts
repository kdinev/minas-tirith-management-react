/// <reference types="vitest/config" />
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * A GitHub Pages project site is served from `https://<owner>.github.io/<repo>/`,
 * so both the built asset URLs and the router's basename have to carry that
 * prefix. CI sets `VITE_BASE`; a plain local build stays at the root.
 *
 * Vite exposes this back to the app as `import.meta.env.BASE_URL`, which is what
 * `main.tsx` gives the router — one value, so the two cannot drift apart.
 */
const base = process.env.VITE_BASE || '/'

/**
 * GitHub Pages has no rewrite rule, so a deep link such as `/garrisons` is a
 * genuine 404 — only `/` would ever boot the app. Publishing a copy of
 * `index.html` as `404.html` lets Pages serve the SPA for any unknown path and
 * lets the router read the URL from there.
 *
 * This lives in the build rather than in the workflow so that `vite preview` and
 * a local `npm run build` behave the same way the deployed site does.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const index = resolve(outDir, 'index.html')
      if (existsSync(index)) {
        copyFileSync(index, resolve(outDir, '404.html'))
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base,
  build: {
    chunkSizeWarningLimit: 10 * 1024 * 1024, // 10 MB
  },
  plugins: [react(), spaFallback()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }]
    }
  },
  resolve: {
    mainFields: ['module'],
  },
  server: {
    open: true,
    port: 3003
  }
})
