import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/seo/performance-monitor';
import { seoCache } from '@/lib/seo/cache-manager';
import { seoErrorHandler } from '@/lib/seo/error-handler';
import { SEOHealthMonitor } from '@/lib/seo/resilient-seo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return await getOverviewData();
      case 'performance':
        return await getPerformanceData();
      case 'technical':
        return await getTechnicalData();
      case 'health':
        return await getHealthData();
      case 'alerts':
        return await getAlertsData();
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('SEO Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getOverviewData() {
  try {
    // Get Core Web Vitals
    const coreWebVitals = await performanceMonitor.trackCoreWebVitals();
    
    // Get CTR data
    const ctrData = await performanceMonitor.monitorCTRImprovement();
    
    // Get indexing progress
    const indexingProgress = await performanceMonitor.trackIndexingProgress();
    
    // Mock additional data (in real implementation, this would come from analytics)
    const overviewData = {
      ctr: {
        current: ctrData.currentCTR,
        previous: ctrData.previousCTR,
        target: ctrData.targetCTR,
        trend: ctrData.improvement > 0 ? 'up' : 'down'
      },
      indexing: {
        current: indexingProgress.indexedPages,
        target: indexingProgress.targetPages,
        progress: (indexingProgress.indexedPages / indexingProgress.targetPages) * 100,
        newlyIndexed: indexingProgress.newlyIndexed,
        crawlErrors: indexingProgress.crawlErrors
      },
      coreWebVitals: {
        lcp: coreWebVitals.lcp / 1000, // Convert to seconds
        fid: coreWebVitals.fid,
        cls: coreWebVitals.cls,
        score: getCoreWebVitalsScore(coreWebVitals)
      },
      traffic: {
        organic: 15420, // Mock data
        growth: 23.5,
        topKeywords: 42,
        avgPosition: 18.2
      },
      technical: {
        structuredData: 95,
        pagespeedScore: 78,
        mobileUsability: 98,
        sslScore: 100
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(overviewData);
  } catch (error) {
    console.error('Overview data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}

async function getPerformanceData() {
  try {
    const report = await performanceMonitor.generateSEOReport();
    
    const performanceData = {
      ctrPerformance: {
        current: report.ctrData.currentCTR,
        previous: report.ctrData.previousCTR,
        target: report.ctrData.targetCTR,
        improvement: report.ctrData.improvement,
        pageData: report.ctrData.pageData
      },
      indexingPerformance: {
        current: report.indexingProgress.indexedPages,
        target: report.indexingProgress.targetPages,
        progress: (report.indexingProgress.indexedPages / report.indexingProgress.targetPages) * 100,
        newlyIndexed: report.indexingProgress.newlyIndexed,
        crawlErrors: report.indexingProgress.crawlErrors,
        pageTypes: report.indexingProgress.pageTypes
      },
      coreWebVitals: {
        lcp: report.coreWebVitals.lcp / 1000,
        fid: report.coreWebVitals.fid,
        cls: report.coreWebVitals.cls,
        fcp: report.coreWebVitals.fcp / 1000,
        ttfb: report.coreWebVitals.ttfb,
        score: getCoreWebVitalsScore(report.coreWebVitals)
      },
      organicTraffic: report.seoMetrics.organicTraffic,
      keywordRankings: report.seoMetrics.keywordRankings,
      lastUpdated: report.generatedAt.toISOString()
    };

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Performance data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

async function getTechnicalData() {
  try {
    const report = await performanceMonitor.generateSEOReport();
    
    const technicalData = {
      technicalSEO: report.seoMetrics.technicalSEO,
      coreWebVitalsDetails: {
        lcp: {
          value: report.coreWebVitals.lcp / 1000,
          target: 2.5,
          status: report.coreWebVitals.lcp <= 2500 ? 'good' : 
                  report.coreWebVitals.lcp <= 4000 ? 'needs-improvement' : 'poor'
        },
        fid: {
          value: report.coreWebVitals.fid,
          target: 100,
          status: report.coreWebVitals.fid <= 100 ? 'good' : 
                  report.coreWebVitals.fid <= 300 ? 'needs-improvement' : 'poor'
        },
        cls: {
          value: report.coreWebVitals.cls,
          target: 0.1,
          status: report.coreWebVitals.cls <= 0.1 ? 'good' : 
                  report.coreWebVitals.cls <= 0.25 ? 'needs-improvement' : 'poor'
        }
      },
      contentMetrics: report.seoMetrics.contentMetrics,
      lastUpdated: report.generatedAt.toISOString()
    };

    return NextResponse.json(technicalData);
  } catch (error) {
    console.error('Technical data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technical data' },
      { status: 500 }
    );
  }
}

async function getHealthData() {
  try {
    const systemHealth = await SEOHealthMonitor.checkSystemHealth();
    
    // Get cache statistics
    const cacheManager = await seoCache;
    const cacheStats = await cacheManager.getCacheStatistics();
    
    // Get error statistics
    const errorStats = seoErrorHandler.getErrorStats();
    
    const healthData = {
      systemHealth,
      cacheHealth: {
        totalCaches: cacheStats.totalCaches,
        healthyCount: cacheStats.healthyCount,
        degradedCount: cacheStats.degradedCount,
        unhealthyCount: cacheStats.unhealthyCount,
        totalSize: cacheStats.totalSize
      },
      errorStats: {
        totalErrors: errorStats.totalErrors,
        errorsByComponent: errorStats.errorsByComponent,
        errorsBySeverity: errorStats.errorsBySeverity,
        recentErrors: errorStats.recentErrors.slice(0, 5) // Last 5 errors
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health data' },
      { status: 500 }
    );
  }
}

async function getAlertsData() {
  try {
    // Get error statistics for alerts
    const errorStats = seoErrorHandler.getErrorStats();
    
    // Get performance data for threshold alerts
    const coreWebVitals = await performanceMonitor.trackCoreWebVitals();
    const ctrData = await performanceMonitor.monitorCTRImprovement();
    const indexingProgress = await performanceMonitor.trackIndexingProgress();
    
    const alerts = [];
    
    // CTR alerts
    if (ctrData.currentCTR < ctrData.targetCTR) {
      alerts.push({
        id: 'ctr-below-target',
        type: 'warning',
        title: 'CTR Below Target',
        message: `Current CTR (${ctrData.currentCTR}%) is below target (${ctrData.targetCTR}%). Consider optimizing meta descriptions.`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
    
    // Indexing alerts
    if (indexingProgress.crawlErrors > 0) {
      alerts.push({
        id: 'crawl-errors',
        type: 'critical',
        title: 'Crawl Errors Detected',
        message: `${indexingProgress.crawlErrors} crawl errors found. Check sitemap and fix broken links.`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
    
    // Core Web Vitals alerts
    if (coreWebVitals.lcp > 4000) {
      alerts.push({
        id: 'lcp-poor',
        type: 'critical',
        title: 'Poor LCP Performance',
        message: `LCP is ${(coreWebVitals.lcp / 1000).toFixed(2)}s (target: < 2.5s). Optimize images and server response time.`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
    
    // Success alerts
    if (indexingProgress.newlyIndexed > 0) {
      alerts.push({
        id: 'new-pages-indexed',
        type: 'info',
        title: 'New Pages Indexed',
        message: `${indexingProgress.newlyIndexed} new pages have been successfully indexed by Google.`,
        timestamp: new Date().toISOString(),
        resolved: true
      });
    }
    
    // Error-based alerts
    if (errorStats.totalErrors > 10) {
      alerts.push({
        id: 'high-error-count',
        type: 'warning',
        title: 'High Error Count',
        message: `${errorStats.totalErrors} errors logged recently. Check system stability.`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
    
    const alertsData = {
      alerts: alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.type === 'critical' && !a.resolved).length,
        warning: alerts.filter(a => a.type === 'warning' && !a.resolved).length,
        info: alerts.filter(a => a.type === 'info').length
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(alertsData);
  } catch (error) {
    console.error('Alerts data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts data' },
      { status: 500 }
    );
  }
}

function getCoreWebVitalsScore(vitals: any): 'good' | 'needs-improvement' | 'poor' {
  const lcpScore = vitals.lcp <= 2500 ? 2 : vitals.lcp <= 4000 ? 1 : 0;
  const fidScore = vitals.fid <= 100 ? 2 : vitals.fid <= 300 ? 1 : 0;
  const clsScore = vitals.cls <= 0.1 ? 2 : vitals.cls <= 0.25 ? 1 : 0;
  
  const totalScore = lcpScore + fidScore + clsScore;
  
  if (totalScore >= 5) return 'good';
  if (totalScore >= 3) return 'needs-improvement';
  return 'poor';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'refresh-cache':
        // Trigger cache refresh
        const cacheManager = await seoCache;
        await cacheManager.warmCaches();
        return NextResponse.json({ success: true, message: 'Cache refreshed successfully' });
        
      case 'clear-errors':
        // Clear error log
        seoErrorHandler.clearErrorLog();
        return NextResponse.json({ success: true, message: 'Error log cleared' });
        
      case 'resolve-alert':
        // In a real implementation, this would update alert status in database
        return NextResponse.json({ success: true, message: 'Alert resolved' });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('SEO Dashboard POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}