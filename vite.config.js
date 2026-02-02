
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
      '.ngrok-free.app', // Allow all ngrok subdomains
      '.ngrok.io', // Allow all ngrok.io subdomains
      '.ngrok.app' // Allow all ngrok.app subdomains
    ]
  }
})
