import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom', 'react-router-dom', 'axios'],
                    'charts': ['recharts'],
                    'pages': ['./src/pages/Landing', './src/pages/Auth', './src/pages/Dashboard', './src/pages/Projects', './src/pages/Estimate', './src/pages/TaskBoard', './src/pages/Insights', './src/pages/Settings'],
                }
            }
        },
        chunkSizeWarningLimit: 600
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
});
