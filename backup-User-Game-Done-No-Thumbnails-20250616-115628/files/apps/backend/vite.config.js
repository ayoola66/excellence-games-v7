import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    loader: { '.js': 'jsx' },
    include: /\.(jsx|js)$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}); 