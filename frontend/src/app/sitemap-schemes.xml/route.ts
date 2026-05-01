// Dynamic sitemap generation for schemes
import { NextResponse } from 'next/server';
import { indexingManager } from '@/lib/seo/indexing-manager';

export async function GET() {
  try {
    const sitemapEntries = await indexingManager.generateSitemap('schemes');
    const xmlContent = indexingManager.generateSitemapXML(sitemapEntries);
    
    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=7200, s-maxage=7200', // Cache for 2 hours
      },
    });
  } catch (error) {
    console.error('Schemes sitemap generation failed:', error);
    
    // Return minimal sitemap on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sarkaripulse.net/schemes</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}