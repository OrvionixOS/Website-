/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * When SITE_URL is set (e.g. https://www.example.com), add canonical and
 * og:url tags and make social image URLs absolute. Left unset, the page ships
 * with relative social image paths and no canonical tag, so no domain is
 * invented before one is approved.
 */
function siteUrlMeta(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/+$/, '');
  return {
    name: 'orvionix-site-url-meta',
    transformIndexHtml(html) {
      if (!base) return html;
      return html
        .replace(/content="\.?\/og-image\.png"/g, `content="${base}/og-image.png"`)
        .replace(
          '</head>',
          `  <link rel="canonical" href="${base}/" />\n    <meta property="og:url" content="${base}/" />\n  </head>`,
        );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // BASE_PATH='./' lets the build run from a sub-path such as a GitHub Pages project site.
    base: env.BASE_PATH || '/',
    plugins: [siteUrlMeta(env.SITE_URL ?? '')],
    build: {
      target: 'es2020',
      cssCodeSplit: false,
      assetsInlineLimit: 0,
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.ts'],
    },
  };
});
