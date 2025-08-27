import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      overlay: false // Désactive les overlays d'erreur en développement
    }
  },
  build: {
    sourcemap: true
  },
  define: {
    // Désactive les avertissements React Router v7 (optionnel)
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
