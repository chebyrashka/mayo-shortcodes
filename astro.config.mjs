import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';

const isNetlifyBuild = process.env.NETLIFY === 'true';

export default defineConfig({
  output: 'server',
  adapter: isNetlifyBuild ? netlify() : node({ mode: 'standalone' })
});
