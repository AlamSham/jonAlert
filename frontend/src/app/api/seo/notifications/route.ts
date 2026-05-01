import { NextRequest, NextResponse } from 'next/server';
import { seoNotificationSystem } from '@/lib/seo/notification-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats':
        return await getNotificationStats();
      case 'test-email':
        return await testEmailNotification();
      case 'test-slack':
        return await testSlackNotification();
      case 'generate-report':
        const reportType = searchParams.get('type') || 'weekly';
        return await generateReport(reportType);
      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('SEO Notifications API error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update-config':
        return await updateNotificationConfig(data);
      case 'update-thresholds':
        return await updateAlertThresholds(data);
      case 'send-test-alert':
        return await sendTestAlert(data);
      case 'generate-manual-report':
        return await generateManualReport(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('SEO Notifications POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification request' },
      { status: 500 }
    );
  }
}

async function getNotificationStats() {
  try {
    const stats = seoNotificationSystem.getNotificationStats();
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        systemStatus: 'active',
        nextScheduledReport: getNextScheduledReportTime(),
        availableChannels: ['email', 'slack', 'webhook'],
        currentThresholds: {
          ctrDropBelow: 1.5,
          indexedPagesBelow: 30,
          lcpAbove: 3000,
          clsAbove: 0.15,
          crawlErrorsAbove: 10,
          errorCountAbove: 50
        }
      }
    });
  } catch (error) {
    console.error('Failed to get notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to get notification statistics' },
      { status: 500 }
    );
  }
}

async function testEmailNotification() {
  try {
    // Mock email test
    console.log('Testing email notification...');
    
    // In real implementation, this would send a test email
    const testResult = {
      success: true,
      message: 'Test email sent successfully',
      timestamp: new Date().toISOString(),
      recipients: ['admin@sarkaripulse.net'] // Mock recipients
    };

    return NextResponse.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Email test failed:', error);
    return NextResponse.json(
      { error: 'Email test failed' },
      { status: 500 }
    );
  }
}

async function testSlackNotification() {
  try {
    // Mock Slack test
    console.log('Testing Slack notification...');
    
    // In real implementation, this would send a test Slack message
    const testResult = {
      success: true,
      message: 'Test Slack message sent successfully',
      timestamp: new Date().toISOString(),
      channel: '#seo-alerts' // Mock channel
    };

    return NextResponse.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Slack test failed:', error);
    return NextResponse.json(
      { error: 'Slack test failed' },
      { status: 500 }
    );
  }
}

async function generateReport(reportType: string) {
  try {
    console.log(`Generating ${reportType} report...`);
    
    let report;
    if (reportType === 'weekly') {
      report = await seoNotificationSystem.generateWeeklyReport();
    } else if (reportType === 'monthly') {
      report = await seoNotificationSystem.generateMonthlyReport();
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        reportId: report.id,
        reportType,
        generatedAt: report.generatedAt,
        summary: report.summary,
        keyMetrics: {
          ctr: report.ctrData.currentCTR,
          indexedPages: report.indexingProgress.indexedPages,
          organicTraffic: report.seoMetrics.organicTraffic.current,
          coreWebVitalsScore: getCoreWebVitalsScore(report.coreWebVitals)
        }
      }
    });
  } catch (error) {
    console.error(`Failed to generate ${reportType} report:`, error);
    return NextResponse.json(
      { error: `Failed to generate ${reportType} report` },
      { status: 500 }
    );
  }
}

async function updateNotificationConfig(config: any) {
  try {
    seoNotificationSystem.updateConfig(config);
    
    return NextResponse.json({
      success: true,
      message: 'Notification configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Failed to update notification config:', error);
    return NextResponse.json(
      { error: 'Failed to update notification configuration' },
      { status: 500 }
    );
  }
}

async function updateAlertThresholds(thresholds: any) {
  try {
    seoNotificationSystem.updateThresholds(thresholds);
    
    return NextResponse.json({
      success: true,
      message: 'Alert thresholds updated successfully',
      data: thresholds
    });
  } catch (error) {
    console.error('Failed to update alert thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to update alert thresholds' },
      { status: 500 }
    );
  }
}

async function sendTestAlert(alertData: any) {
  try {
    const testAlerts = [{
      type: 'info',
      title: 'Test Alert',
      message: 'This is a test alert to verify notification system functionality.',
      metric: 'Test',
      value: 'N/A',
      threshold: 'N/A'
    }];

    // Mock sending test alert
    console.log('Sending test alert:', testAlerts);
    
    return NextResponse.json({
      success: true,
      message: 'Test alert sent successfully',
      data: {
        alertsSent: testAlerts.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to send test alert:', error);
    return NextResponse.json(
      { error: 'Failed to send test alert' },
      { status: 500 }
    );
  }
}

async function generateManualReport(reportData: any) {
  try {
    const { reportType, includeAnalysis, recipients } = reportData;
    
    let report;
    if (reportType === 'weekly') {
      report = await seoNotificationSystem.generateWeeklyReport();
    } else if (reportType === 'monthly') {
      report = await seoNotificationSystem.generateMonthlyReport();
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // If specific recipients provided, send to them
    if (recipients && recipients.length > 0) {
      console.log(`Sending manual report to: ${recipients.join(', ')}`);
      // In real implementation, would override default recipients
    }

    return NextResponse.json({
      success: true,
      message: `Manual ${reportType} report generated and sent successfully`,
      data: {
        reportId: report.id,
        reportType,
        generatedAt: report.generatedAt,
        recipients: recipients || ['default recipients'],
        includeAnalysis
      }
    });
  } catch (error) {
    console.error('Failed to generate manual report:', error);
    return NextResponse.json(
      { error: 'Failed to generate manual report' },
      { status: 500 }
    );
  }
}

function getNextScheduledReportTime(): string {
  // Calculate next Monday 8 AM for weekly report
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
  nextMonday.setHours(8, 0, 0, 0);
  
  return nextMonday.toISOString();
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