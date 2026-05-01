// SEO Health Monitoring API endpoint
import { NextResponse } from 'next/server';
import { gscIntegration } from '@/lib/seo/gsc-integration';

export async function GET() {
  try {
    const healthStatus = await gscIntegration.getSEOHealthStatus();
    
    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // Cache for 30 minutes
      },
    });
  } catch (error) {
    console.error('SEO health check failed:', error);
    
    return NextResponse.json(
      {
        overallHealth: 'warning',
        issues: [{
          type: 'performance',
          severity: 'medium',
          message: 'SEO health check temporarily unavailable',
          affectedUrls: 0,
          recommendation: 'Please try again later'
        }],
        metrics: {
          indexedPages: 0,
          crawlErrors: 0,
          averageCTR: 0,
          averagePosition: 0,
          coreWebVitalsScore: 0
        }
      },
      { status: 500 }
    );
  }
}