// SEO Automated Reporting and Notification System
import { performanceMonitor } from './performance-monitor';
import { seoErrorHandler } from './error-handler';
import { SEOHealthMonitor } from './resilient-seo';
import type { PerformanceReport, SEOMetrics, CoreWebVitalsMetrics } from './interfaces';

export interface NotificationConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  slack?: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
  };
  webhook?: {
    enabled: boolean;
    url: string;
    headers?: Record<string, string>;
  };
}

export interface ReportSchedule {
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  onAlert: boolean;
  customCron?: string;
}

export interface AlertThresholds {
  ctrDropBelow: number; // 1.5%
  indexedPagesBelow: number; // 30
  lcpAbove: number; // 3.0s
  clsAbove: number; // 0.15
  crawlErrorsAbove: number; // 10
  positionDropBelow: number; // 20
  trafficDropBelow: number; // -10%
  errorCountAbove: number; // 50
}

export class SEONotificationSystem {
  private static instance: SEONotificationSystem;
  private config: NotificationConfig;
  private schedule: ReportSchedule;
  private thresholds: AlertThresholds;
  private reportHistory: PerformanceReport[] = [];

  private constructor(
    config: NotificationConfig,
    schedule: ReportSchedule,
    thresholds: AlertThresholds
  ) {
    this.config = config;
    this.schedule = schedule;
    this.thresholds = thresholds;
  }

  /**
   * Get singleton instance
   */
  static getInstance(
    config?: NotificationConfig,
    schedule?: ReportSchedule,
    thresholds?: AlertThresholds
  ): SEONotificationSystem {
    if (!SEONotificationSystem.instance) {
      SEONotificationSystem.instance = new SEONotificationSystem(
        config || {
          email: { enabled: false, recipients: [] },
          slack: { enabled: false, webhookUrl: '', channel: '' },
          webhook: { enabled: false, url: '' }
        },
        schedule || {
          daily: false,
          weekly: true,
          monthly: true,
          onAlert: true
        },
        thresholds || {
          ctrDropBelow: 1.5,
          indexedPagesBelow: 30,
          lcpAbove: 3000,
          clsAbove: 0.15,
          crawlErrorsAbove: 10,
          positionDropBelow: 20,
          trafficDropBelow: -10,
          errorCountAbove: 50
        }
      );
    }
    return SEONotificationSystem.instance;
  }

  /**
   * Initialize notification system with scheduled reports
   */
  async initialize(): Promise<void> {
    console.log('Initializing SEO Notification System...');

    // Set up scheduled reports
    if (this.schedule.daily) {
      this.scheduleReport('daily', '0 8 * * *'); // 8 AM daily
    }

    if (this.schedule.weekly) {
      this.scheduleReport('weekly', '0 8 * * 1'); // 8 AM Monday
    }

    if (this.schedule.monthly) {
      this.scheduleReport('monthly', '0 8 1 * *'); // 8 AM 1st of month
    }

    // Set up real-time monitoring
    if (this.schedule.onAlert) {
      this.startRealTimeMonitoring();
    }

    console.log('SEO Notification System initialized');
  }

  /**
   * Generate and send weekly SEO report
   */
  async generateWeeklyReport(): Promise<PerformanceReport> {
    try {
      console.log('Generating weekly SEO report...');
      
      const report = await performanceMonitor.generateSEOReport();
      
      // Store report in history
      this.reportHistory.push(report);
      
      // Keep only last 12 reports (3 months of weekly reports)
      if (this.reportHistory.length > 12) {
        this.reportHistory = this.reportHistory.slice(-12);
      }

      // Send report via configured channels
      await this.sendReport(report, 'weekly');
      
      console.log('Weekly SEO report generated and sent');
      return report;
    } catch (error) {
      console.error('Failed to generate weekly report:', error);
      await this.sendErrorNotification('Weekly Report Generation Failed', error as Error);
      throw error;
    }
  }

  /**
   * Generate and send monthly SEO report
   */
  async generateMonthlyReport(): Promise<PerformanceReport> {
    try {
      console.log('Generating monthly SEO report...');
      
      const report = await performanceMonitor.generateSEOReport();
      
      // Add monthly-specific analysis
      const monthlyAnalysis = await this.generateMonthlyAnalysis(report);
      
      // Enhanced report with monthly insights
      const enhancedReport = {
        ...report,
        monthlyAnalysis,
        reportType: 'monthly'
      };

      // Send enhanced report
      await this.sendReport(enhancedReport, 'monthly');
      
      console.log('Monthly SEO report generated and sent');
      return report;
    } catch (error) {
      console.error('Failed to generate monthly report:', error);
      await this.sendErrorNotification('Monthly Report Generation Failed', error as Error);
      throw error;
    }
  }

  /**
   * Check thresholds and send alerts
   */
  async checkThresholdsAndAlert(): Promise<void> {
    try {
      const [coreWebVitals, ctrData, indexingProgress, systemHealth, errorStats] = await Promise.all([
        performanceMonitor.trackCoreWebVitals(),
        performanceMonitor.monitorCTRImprovement(),
        performanceMonitor.trackIndexingProgress(),
        SEOHealthMonitor.checkSystemHealth(),
        seoErrorHandler.getErrorStats()
      ]);

      const alerts: Array<{
        type: 'critical' | 'warning' | 'info';
        title: string;
        message: string;
        metric: string;
        value: number | string;
        threshold: number | string;
      }> = [];

      // CTR threshold check
      if (ctrData.currentCTR < this.thresholds.ctrDropBelow) {
        alerts.push({
          type: 'warning',
          title: 'CTR Below Threshold',
          message: `CTR has dropped to ${ctrData.currentCTR}% (threshold: ${this.thresholds.ctrDropBelow}%)`,
          metric: 'CTR',
          value: ctrData.currentCTR,
          threshold: this.thresholds.ctrDropBelow
        });
      }

      // Indexing threshold check
      if (indexingProgress.indexedPages < this.thresholds.indexedPagesBelow) {
        alerts.push({
          type: 'warning',
          title: 'Low Indexed Pages',
          message: `Only ${indexingProgress.indexedPages} pages indexed (threshold: ${this.thresholds.indexedPagesBelow})`,
          metric: 'Indexed Pages',
          value: indexingProgress.indexedPages,
          threshold: this.thresholds.indexedPagesBelow
        });
      }

      // Core Web Vitals threshold checks
      if (coreWebVitals.lcp > this.thresholds.lcpAbove) {
        alerts.push({
          type: 'critical',
          title: 'Poor LCP Performance',
          message: `LCP is ${(coreWebVitals.lcp / 1000).toFixed(2)}s (threshold: ${this.thresholds.lcpAbove / 1000}s)`,
          metric: 'LCP',
          value: coreWebVitals.lcp / 1000,
          threshold: this.thresholds.lcpAbove / 1000
        });
      }

      if (coreWebVitals.cls > this.thresholds.clsAbove) {
        alerts.push({
          type: 'critical',
          title: 'Poor CLS Performance',
          message: `CLS is ${coreWebVitals.cls.toFixed(3)} (threshold: ${this.thresholds.clsAbove})`,
          metric: 'CLS',
          value: coreWebVitals.cls,
          threshold: this.thresholds.clsAbove
        });
      }

      // Crawl errors check
      if (indexingProgress.crawlErrors > this.thresholds.crawlErrorsAbove) {
        alerts.push({
          type: 'critical',
          title: 'High Crawl Error Count',
          message: `${indexingProgress.crawlErrors} crawl errors detected (threshold: ${this.thresholds.crawlErrorsAbove})`,
          metric: 'Crawl Errors',
          value: indexingProgress.crawlErrors,
          threshold: this.thresholds.crawlErrorsAbove
        });
      }

      // Error count check
      if (errorStats.totalErrors > this.thresholds.errorCountAbove) {
        alerts.push({
          type: 'warning',
          title: 'High System Error Count',
          message: `${errorStats.totalErrors} system errors logged (threshold: ${this.thresholds.errorCountAbove})`,
          metric: 'System Errors',
          value: errorStats.totalErrors,
          threshold: this.thresholds.errorCountAbove
        });
      }

      // System health check
      if (systemHealth.status === 'unhealthy') {
        alerts.push({
          type: 'critical',
          title: 'System Health Critical',
          message: `SEO system is unhealthy: ${systemHealth.errors.join(', ')}`,
          metric: 'System Health',
          value: systemHealth.status,
          threshold: 'healthy'
        });
      } else if (systemHealth.status === 'degraded') {
        alerts.push({
          type: 'warning',
          title: 'System Health Degraded',
          message: `SEO system is degraded: ${systemHealth.errors.join(', ')}`,
          metric: 'System Health',
          value: systemHealth.status,
          threshold: 'healthy'
        });
      }

      // Send alerts if any
      if (alerts.length > 0) {
        await this.sendAlerts(alerts);
      }

    } catch (error) {
      console.error('Threshold checking failed:', error);
      await this.sendErrorNotification('Threshold Monitoring Failed', error as Error);
    }
  }

  /**
   * Send report via configured channels
   */
  private async sendReport(report: any, reportType: string): Promise<void> {
    const reportContent = this.formatReport(report, reportType);

    const promises: Promise<void>[] = [];

    if (this.config.email?.enabled) {
      promises.push(this.sendEmailReport(reportContent, reportType));
    }

    if (this.config.slack?.enabled) {
      promises.push(this.sendSlackReport(reportContent, reportType));
    }

    if (this.config.webhook?.enabled) {
      promises.push(this.sendWebhookReport(report, reportType));
    }

    await Promise.all(promises);
  }

  /**
   * Send alerts via configured channels
   */
  private async sendAlerts(alerts: any[]): Promise<void> {
    const alertContent = this.formatAlerts(alerts);

    const promises: Promise<void>[] = [];

    if (this.config.email?.enabled) {
      promises.push(this.sendEmailAlert(alertContent));
    }

    if (this.config.slack?.enabled) {
      promises.push(this.sendSlackAlert(alertContent));
    }

    if (this.config.webhook?.enabled) {
      promises.push(this.sendWebhookAlert(alerts));
    }

    await Promise.all(promises);
  }

  /**
   * Format report for human consumption
   */
  private formatReport(report: any, reportType: string): string {
    const period = reportType === 'weekly' ? 'Week' : 
                  reportType === 'monthly' ? 'Month' : 'Period';

    return `
# SEO Performance Report - ${period}
Generated: ${new Date().toLocaleString()}

## Key Metrics
- **CTR**: ${report.ctrData.currentCTR}% (${report.ctrData.improvement > 0 ? '+' : ''}${report.ctrData.improvement.toFixed(1)}%)
- **Indexed Pages**: ${report.indexingProgress.indexedPages}/${report.indexingProgress.targetPages} (${((report.indexingProgress.indexedPages / report.indexingProgress.targetPages) * 100).toFixed(1)}%)
- **Organic Traffic**: ${report.seoMetrics.organicTraffic.current.toLocaleString()} (+${report.seoMetrics.organicTraffic.growth}%)
- **Top 10 Keywords**: ${report.seoMetrics.keywordRankings.topTen}

## Core Web Vitals
- **LCP**: ${(report.coreWebVitals.lcp / 1000).toFixed(2)}s
- **FID**: ${report.coreWebVitals.fid}ms
- **CLS**: ${report.coreWebVitals.cls.toFixed(3)}

## Technical SEO
- **Structured Data**: ${report.seoMetrics.technicalSEO.structuredDataValid}% valid
- **PageSpeed Score**: ${report.seoMetrics.technicalSEO.pagespeedScore}
- **Mobile Usability**: ${report.seoMetrics.technicalSEO.mobileUsability}%
- **Crawl Errors**: ${report.seoMetrics.technicalSEO.crawlErrors}

## Summary
${report.summary}

## Recommendations
${report.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---
SarkariPulse SEO Monitoring System
    `.trim();
  }

  /**
   * Format alerts for notification
   */
  private formatAlerts(alerts: any[]): string {
    const criticalCount = alerts.filter(a => a.type === 'critical').length;
    const warningCount = alerts.filter(a => a.type === 'warning').length;

    let content = `# SEO Alerts - ${new Date().toLocaleString()}\n\n`;
    content += `**Summary**: ${criticalCount} critical, ${warningCount} warnings\n\n`;

    alerts.forEach(alert => {
      const emoji = alert.type === 'critical' ? '🚨' : 
                   alert.type === 'warning' ? '⚠️' : 'ℹ️';
      content += `${emoji} **${alert.title}**\n`;
      content += `${alert.message}\n\n`;
    });

    content += '---\nSarkariPulse SEO Monitoring System';
    return content;
  }

  /**
   * Send email report (mock implementation)
   */
  private async sendEmailReport(content: string, reportType: string): Promise<void> {
    try {
      console.log(`Sending ${reportType} email report to:`, this.config.email?.recipients);
      
      // In real implementation, this would use nodemailer or similar
      // const transporter = nodemailer.createTransporter(this.config.email.smtpConfig);
      // await transporter.sendMail({
      //   from: 'seo@sarkaripulse.net',
      //   to: this.config.email.recipients.join(','),
      //   subject: `SEO ${reportType} Report - SarkariPulse`,
      //   text: content,
      //   html: this.convertToHTML(content)
      // });
      
      console.log('Email report sent successfully');
    } catch (error) {
      console.error('Failed to send email report:', error);
    }
  }

  /**
   * Send email alert (mock implementation)
   */
  private async sendEmailAlert(content: string): Promise<void> {
    try {
      console.log('Sending email alert to:', this.config.email?.recipients);
      
      // Mock implementation
      console.log('Email alert sent successfully');
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  /**
   * Send Slack report (mock implementation)
   */
  private async sendSlackReport(content: string, reportType: string): Promise<void> {
    try {
      console.log(`Sending ${reportType} Slack report to:`, this.config.slack?.channel);
      
      // In real implementation, this would use Slack webhook
      // await fetch(this.config.slack.webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     channel: this.config.slack.channel,
      //     text: `SEO ${reportType} Report`,
      //     attachments: [{
      //       color: 'good',
      //       text: content,
      //       mrkdwn_in: ['text']
      //     }]
      //   })
      // });
      
      console.log('Slack report sent successfully');
    } catch (error) {
      console.error('Failed to send Slack report:', error);
    }
  }

  /**
   * Send Slack alert (mock implementation)
   */
  private async sendSlackAlert(content: string): Promise<void> {
    try {
      console.log('Sending Slack alert to:', this.config.slack?.channel);
      
      // Mock implementation
      console.log('Slack alert sent successfully');
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  /**
   * Send webhook report
   */
  private async sendWebhookReport(report: any, reportType: string): Promise<void> {
    try {
      console.log(`Sending ${reportType} webhook report to:`, this.config.webhook?.url);
      
      // In real implementation, this would make HTTP request
      // await fetch(this.config.webhook.url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...this.config.webhook.headers
      //   },
      //   body: JSON.stringify({
      //     type: 'seo-report',
      //     reportType,
      //     data: report,
      //     timestamp: new Date().toISOString()
      //   })
      // });
      
      console.log('Webhook report sent successfully');
    } catch (error) {
      console.error('Failed to send webhook report:', error);
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alerts: any[]): Promise<void> {
    try {
      console.log('Sending webhook alert to:', this.config.webhook?.url);
      
      // Mock implementation
      console.log('Webhook alert sent successfully');
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  /**
   * Send error notification
   */
  private async sendErrorNotification(title: string, error: Error): Promise<void> {
    const errorContent = `
# System Error - ${title}
Time: ${new Date().toLocaleString()}

**Error**: ${error.message}

**Stack Trace**:
${error.stack}

---
SarkariPulse SEO Monitoring System
    `.trim();

    if (this.config.slack?.enabled) {
      await this.sendSlackAlert(errorContent);
    }

    if (this.config.email?.enabled) {
      await this.sendEmailAlert(errorContent);
    }
  }

  /**
   * Generate monthly analysis
   */
  private async generateMonthlyAnalysis(report: PerformanceReport): Promise<any> {
    // Compare with previous reports for trends
    const previousReports = this.reportHistory.slice(-4); // Last 4 weeks
    
    if (previousReports.length === 0) {
      return {
        trends: 'Insufficient data for trend analysis',
        insights: ['This is the first report in the system'],
        forecast: 'Baseline established for future comparisons'
      };
    }

    // Calculate trends
    const ctrTrend = this.calculateTrend(
      previousReports.map(r => r.ctrData.currentCTR),
      report.ctrData.currentCTR
    );

    const trafficTrend = this.calculateTrend(
      previousReports.map(r => r.seoMetrics.organicTraffic.current),
      report.seoMetrics.organicTraffic.current
    );

    return {
      trends: {
        ctr: ctrTrend,
        traffic: trafficTrend
      },
      insights: [
        `CTR ${ctrTrend > 0 ? 'improved' : 'declined'} by ${Math.abs(ctrTrend).toFixed(1)}%`,
        `Organic traffic ${trafficTrend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trafficTrend).toFixed(1)}%`
      ],
      forecast: this.generateForecast(report)
    };
  }

  /**
   * Calculate trend percentage
   */
  private calculateTrend(historicalValues: number[], currentValue: number): number {
    if (historicalValues.length === 0) return 0;
    
    const average = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    return ((currentValue - average) / average) * 100;
  }

  /**
   * Generate forecast
   */
  private generateForecast(report: PerformanceReport): string {
    const ctrProgress = (report.ctrData.currentCTR / report.ctrData.targetCTR) * 100;
    const indexingProgress = (report.indexingProgress.indexedPages / report.indexingProgress.targetPages) * 100;

    if (ctrProgress >= 100 && indexingProgress >= 100) {
      return 'All targets achieved. Focus on maintaining performance and exploring new opportunities.';
    } else if (ctrProgress >= 80 && indexingProgress >= 80) {
      return 'On track to meet targets. Continue current optimization strategies.';
    } else {
      return 'Targets at risk. Consider intensifying optimization efforts and reviewing strategies.';
    }
  }

  /**
   * Schedule report generation
   */
  private scheduleReport(type: string, cronExpression: string): void {
    console.log(`Scheduling ${type} report with cron: ${cronExpression}`);
    
    // In real implementation, this would use node-cron or similar
    // cron.schedule(cronExpression, async () => {
    //   try {
    //     if (type === 'weekly') {
    //       await this.generateWeeklyReport();
    //     } else if (type === 'monthly') {
    //       await this.generateMonthlyReport();
    //     }
    //   } catch (error) {
    //     console.error(`Failed to generate ${type} report:`, error);
    //   }
    // });
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    console.log('Starting real-time SEO monitoring...');
    
    // Check thresholds every 15 minutes
    setInterval(async () => {
      await this.checkThresholdsAndAlert();
    }, 15 * 60 * 1000);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Update thresholds
   */
  updateThresholds(thresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): {
    reportsGenerated: number;
    alertsSent: number;
    lastReportDate: Date | null;
    configuredChannels: string[];
  } {
    return {
      reportsGenerated: this.reportHistory.length,
      alertsSent: 0, // Would track this in real implementation
      lastReportDate: this.reportHistory.length > 0 ? 
        this.reportHistory[this.reportHistory.length - 1].generatedAt : null,
      configuredChannels: [
        ...(this.config.email?.enabled ? ['email'] : []),
        ...(this.config.slack?.enabled ? ['slack'] : []),
        ...(this.config.webhook?.enabled ? ['webhook'] : [])
      ]
    };
  }
}

// Export singleton instance
export const seoNotificationSystem = SEONotificationSystem.getInstance();

// Initialize notification system on module load
if (typeof window === 'undefined') {
  // Server-side initialization
  seoNotificationSystem.initialize().catch(error => {
    console.error('Failed to initialize SEO notification system:', error);
  });
}