// Sitemap index generation
import { NextResponse } from 'next/server';
import { indexingManager } from '@/lib/seo/indexing-manager';

export async function GET() {
  try {
    const sitemapIndex = await indexingManager.generateSitemapIndex();
    const xmlContent = indexingManager.generateSitemapIndexXML(sitemapIndex.sitemaps);
    
    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Sitemap index generation failed:', error);
    
    // Return minimal sitemap index on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://sarkaripulse.net/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
    
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}