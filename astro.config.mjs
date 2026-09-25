import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hybridlog.de',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
