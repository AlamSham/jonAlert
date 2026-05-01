// URL indexing request API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { gscIntegration } from '@/lib/seo/gsc-integration';
import { indexingManager } from '@/lib/seo/indexing-manager';

export async function POST(request: NextRequest) {
  try {
    const { urls, method = 'gsc' } = await request.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Validate URLs
    const validUrls = urls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      );
    }

    let results;

    if (method === 'gsc') {
      // Use Google Search Console Indexing API
      results = await gscIntegration.requestIndexing(validUrls);
    } else {
      // Use IndexingManager for other methods
      results = await indexingManager.requestIndexing(validUrls);
    }

    const successCount = results.filter(result => result.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: successCount > 0,
      message: `Indexing requested for ${successCount} URLs${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Indexing request API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}