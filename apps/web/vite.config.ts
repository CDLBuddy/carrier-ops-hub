// carrier-ops-hub/apps/web/vite.config.ts

import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/app/routing/routes',
      generatedRouteTree: './src/app/routing/routeTree.gen.ts',
      routeFileIgnorePattern: '.ts$',
    }),
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    open: true,
  },
})
