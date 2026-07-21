import { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://achieveacademy.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/*?q=*',
          '/*?subject=*',
          '/*?class=*',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
