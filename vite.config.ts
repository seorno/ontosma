import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          concepts: path.resolve(__dirname, 'concepts.html'),
          newsletter: path.resolve(__dirname, 'newsletter.html'),
          pluripotency: path.resolve(__dirname, 'concepts/pluripotency.html'),
          transcription: path.resolve(__dirname, 'concepts/transcription.html'),
          blastema: path.resolve(__dirname, 'concepts/blastema.html'),
          fermentation: path.resolve(__dirname, 'concepts/fermentation.html'),
          foodCultures: path.resolve(__dirname, 'concepts/food-cultures.html'),
          dnaReplication: path.resolve(__dirname, 'concepts/dna-replication.html'),
        },
      },
    },
  };
});
