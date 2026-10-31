import { site } from '@/lib/site';
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/keystatic', '/api/'] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
