import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/AII_Candidate-UX_Local/',
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  resolve: {
    alias: {
      '@i18n': path.resolve(__dirname, 'src/ai-interview-candex/i18n'),
      '@components': path.resolve(__dirname, 'src/ai-interview-candex/components'),
      '@screens': path.resolve(__dirname, 'src/ai-interview-candex/screens'),
      '@context': path.resolve(__dirname, 'src/ai-interview-candex/context'),
    },
  },
  build: {
    cssMinify: false,
  },
  server: {
    port: parseInt(process.env.PORT || '5173'),
  },
});
