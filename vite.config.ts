import path from 'path'
import fs from 'fs'
import { defineConfig, loadEnv } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import serveStatic from 'serve-static'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const port = 5173
  const infinityUrl = env.VITE_INFINITY_TARGET
  const devAssetsPath = path.resolve(__dirname, 'dev-assets')

  if (mode === 'development') {
    if (!infinityUrl) {
      throw new Error(
        'Infinity URL is not defined. Please set VITE_INFINITY_TARGET value in the .env file. Check the README for more details.'
      )
    }
  }

  return {
    base: './',
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`
        }
      }
    },

    plugins: [
      mkcert(),
      // Serve /dev-assets as /dev during dev mode only
      {
        name: 'serve-dev-assets',
        apply: 'serve', // only during dev
        configureServer(server) {
          if (fs.existsSync(devAssetsPath)) {
            server.middlewares.use(
              '/dev',
              serveStatic(devAssetsPath, {
                index: false
              })
            )
            console.log('🟢 Serving /dev-assets at /dev')
          } else {
            console.warn(
              '⚠️  dev-assets folder not found. Skipping static serving.'
            )
          }
        }
      }
    ],

    server: {
      open: '/webapp3/',
      allowedHosts: ['localhost'],
      proxy: {
        '/webapp3/branding/manifest.json': {
          target: `https://localhost:${port}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) =>
            path.replace(
              /^\/webapp3\/branding\/manifest\.json$/,
              '/dev/manifest.json'
            )
        },
        '/api': {
          target: infinityUrl,
          changeOrigin: true,
          secure: false
        },
        '/webapp3': {
          target: infinityUrl,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
