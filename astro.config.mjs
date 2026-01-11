// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify/functions';


import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
    adapter: netlify(),

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['fs', 'path'] // add any Node-only modules the error reports
      }
    }
  },
})