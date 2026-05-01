// Sitemap submission API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { gscIntegration } from '@/lib/seo/gsc-integration';
import { indexingManager } from '@/lib/seo/indexing-manager';

export async function POST(request: NextRequest) {
  try {
    const { sitemapUrl, submitToSearchEngines = true } = await request.json();
    
    if (!sitemapUrl) {
      return NextResponse.json(
        { error: 'Sitemap URL is required' },
        { status: 400 }
      );
    }

    const results = [];

    // Submit to Google Search Console
    if (submitToSearchEngines) {
      try {
        const gscResult = await gscIntegration.submitSitemap(sitemapUrl);
        results.push({
          service: 'Google Search Console',
          ...gscResult
        });
      } catch (error) {
        results.push({
          service: 'Google Search Console',
          success: false,
          message: `GSC submission failed: ${(error as Error).message}`
        });
      }

      // Submit to other search engines via IndexingManager
      try {
        const searchEngineResult = await indexingManager.submitToSearchEngines(sitemapUrl);
        results.push({
          service: 'Search Engines',
          ...searchEngineResult
        });
      } catch (error) {
        results.push({
          service: 'Search Engines',
          success: false,
          message: `Search engine submission failed: ${(error as Error).message}`
        });
      }
    }

    const overallSuccess = results.some(result => result.success);

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess 
        ? 'Sitemap submitted successfully'
        : 'Sitemap submission failed',
      results
    });
  } catch (error) {
    console.error('Sitemap submission API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}