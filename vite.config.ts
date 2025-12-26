import { defineConfig, loadEnv } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const port = 5173
  const infinityUrl = env.VITE_INFINITY_URL

  if (mode === 'development') {
    if (!infinityUrl) {
      throw new Error(
        'Infinity URL is not defined. Please set VITE_INFINITY_URL value in the .env file.'
      )
    }
  }

  return {
    base: './',
    server: {
      open: '/webapp3/',
      port: port,
      cors: true,
      proxy: {
        '/webapp3/branding/manifest.json': {
          target: `https://localhost:${port}`,
          secure: false,
          rewrite: (path) =>
            path.replace(
              /^\/webapp3\/branding\/manifest.json$/,
              '/manifest.json'
            )
        },
        '/webapp3': {
          target: infinityUrl,
          secure: false
        },
        '/api': {
          target: infinityUrl,
          secure: false
        }
      }
    },
    plugins: [mkcert()]
  }
})
