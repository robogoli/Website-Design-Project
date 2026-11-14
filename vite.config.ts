// Import Tailwind CSS Vite plugin for utility style compilation
import tailwindcss from '@tailwindcss/vite';
// Import official Vite React plugin for JSX transform and React Fast Refresh
import react from '@vitejs/plugin-react';
// Import Node path utilities for resolving module directory aliases
import path from 'path';
// Import Vite configuration helper for typed bundler settings
import { defineConfig } from 'vite';

// Export Vite configuration customized for GitHub Pages deployment and port 3000 dev preview
export default defineConfig(() => {
  return {
    // Public base URL path used when serving static assets on GitHub Pages
    base: '/Website-Design-Project/',
    // Enable React compilation and Tailwind CSS processing plugins
    plugins: [react(), tailwindcss()],
    // Configure path resolution shortcuts across the source tree
    resolve: {
      alias: {
        // Map '@' imports cleanly to the workspace root directory
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    // Development server network, CORS, and file-watcher settings
    server: {
      // Bind dev preview server to the required port 3000
      port: 3000,
      // Listen on all local network interfaces so container previews stay reachable
      host: '0.0.0.0',
      // Permit proxy host headers inside hosted preview iframes
      allowedHosts: true as const,
      // Enable Cross-Origin Resource Sharing headers during local development
      cors: true,
      // Disable Hot Module Replacement WebSockets when DISABLE_HMR environment flag is set
      hmr: process.env.DISABLE_HMR !== 'true',
      // Turn off filesystem watchers when HMR is disabled to reduce CPU load
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
