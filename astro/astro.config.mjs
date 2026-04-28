// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

async function fetchAndCache() {
  const feedUrl = process.env.BLOG_FEED_URL;
  if (!feedUrl) {
    writeFileSync(
      fileURLToPath(new URL('./src/data/blog-cache.json', import.meta.url)),
      '[]'
    );
    return;
  }
  const { fetchBlogFeed } = await import('./src/lib/fetchBlogFeed.ts');
  const posts = await fetchBlogFeed(feedUrl);
  writeFileSync(
    fileURLToPath(new URL('./src/data/blog-cache.json', import.meta.url)),
    JSON.stringify(posts, null, 2)
  );
}

function blogCacheIntegration() {
  return {
    name: 'blog-cache',
    hooks: {
      'astro:build:start': fetchAndCache,
      'astro:server:start': fetchAndCache,
    },
  };
}

export default defineConfig({
  site: 'https://isaacingram.com',
  integrations: [sitemap(), blogCacheIntegration()],
  vite: {
    plugins: [tailwindcss()],
  },
});
