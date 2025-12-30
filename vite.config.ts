import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const port = Number(env.VITE_DEV_SERVER_PORT) || 5173
  const infinityTarget = env.VITE_INFINITY_TARGET

  const manifestContent = {
    images: {},
    translations: {},
    plugins: [
      {
        src: `https://localhost:${port}`,
        sandboxValues: ['allow-same-origin']
      }
    ]
  }
  const manifest = JSON.stringify(manifestContent)

  if (mode === 'development') {
    if (!infinityTarget) {
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
      // Inline manifest.json: serve in dev
      {
        name: 'inline-manifest',
        apply: 'serve', // only during dev
        configureServer(server) {
          // Serve at /dev/manifest.json (matches existing proxy rewrite)
          server.middlewares.use('/manifest.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(manifest)
          })
        }
      }
    ],

    server: {
      open: '/webapp3/',
      allowedHosts: ['localhost'],
      port: port,
      proxy: {
        '/webapp3/branding/manifest.json': {
          target: `https://localhost:${port}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) =>
            path.replace(
              /^\/webapp3\/branding\/manifest\.json$/,
              '/manifest.json'
            )
        },
        '/api': {
          target: infinityTarget,
          changeOrigin: true,
          secure: false
        },
        '/webapp3': {
          target: infinityTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
