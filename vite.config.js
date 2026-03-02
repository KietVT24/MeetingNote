import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to avoid CORS issues
      '/api/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    },
    allowedHosts: [
      'localhost',
      'https://xink-analysis-meeting-backend-459095746983.asia-southeast1.run.app',
      '127.0.0.1',
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app'
    ]
  },
  optimizeDeps: {
    // Exclude backend Node.js modules from optimization
    exclude: ['express', 'http', 'socket.io', 'pg', 'bcryptjs', 'jsonwebtoken']
  },
  build: {
    rollupOptions: {
      // Exclude backend files from the build
      external: (id) => {
        // Exclude backend entry points and modules
        if (id.includes('/src/app.js')) return true
        if (id.includes('/src/index.js') && !id.includes('main.jsx')) return true
        if (id.includes('/src/config/')) return true
        if (id.includes('/src/controllers/')) return true
        if (id.includes('/src/middlewares/')) return true
        if (id.includes('/src/models/')) return true
        if (id.includes('/src/routes/')) return true
        if (id.includes('/src/socket/')) return true
        if (id.includes('/src/scripts/')) return true
        
        // Exclude Node.js built-in modules
        return ['express', 'http', 'https', 'fs', 'path', 'crypto', 'stream', 'util', 'events', 'buffer', 'querystring', 'url', 'string_decoder', 'punycode', 'os', 'zlib', 'net', 'tls', 'child_process', 'cluster', 'dgram', 'dns', 'readline', 'repl', 'tty', 'vm', 'assert', 'constants', 'domain', 'module', 'process', 'v8', 'timers', 'console', 'pg', 'bcryptjs', 'jsonwebtoken', 'socket.io', 'cors', 'dotenv', 'express-rate-limit', 'cheerio', 'stripe', 'zod', '@google/generative-ai', 'openai', 'nodemon'].includes(id)
      }
    }
  }
})
