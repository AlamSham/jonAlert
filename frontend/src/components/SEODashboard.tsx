'use client';

import React, { useState, useEffect } from 'react';
// Simple UI Components for SEO Dashboard
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900">
    {children}
  </h3>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'destructive' | 'secondary' | 'outline' }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'bg-transparent border border-gray-300 text-gray-700'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, disabled = false }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const Tabs = ({ children, defaultValue, className = '' }: { children: React.ReactNode; defaultValue: string; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={`tabs-container ${className}`} data-active-tab={activeTab}>
      {React.Children.map(children, child => 
        React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab } as any) : child
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab, className = '' }: { children: React.ReactNode; activeTab?: string; setActiveTab?: (tab: string) => void; className?: string }) => (
  <div className={`flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 ${className}`}>
    {React.Children.map(children, child => 
      React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab } as any) : child
    )}
  </div>
);

const TabsTrigger = ({ children, value, activeTab, setActiveTab }: { children: React.ReactNode; value: string; activeTab?: string; setActiveTab?: (tab: string) => void }) => (
  <button
    onClick={() => setActiveTab?.(value)}
    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      activeTab === value 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, activeTab }: { children: React.ReactNode; value: string; activeTab?: string }) => (
  activeTab === value ? <div>{children}</div> : null
);

const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

const Alert = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
    {children}
  </div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm text-yellow-800">
    {children}
  </div>
);

// Simple Icon Components
const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface SEOMetrics {
  ctr: {
    current: number;
    previous: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  indexing: {
    current: number;
    target: number;
    progress: number;
    newlyIndexed: number;
    crawlErrors: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    score: 'good' | 'needs-improvement' | 'poor';
  };
  traffic: {
    organic: number;
    growth: number;
    topKeywords: number;
    avgPosition: number;
  };
  technical: {
    structuredData: number;
    pagespeedScore: number;
    mobileUsability: number;
    sslScore: number;
  };
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  errors: string[];
  recommendations: string[];
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const SEODashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock metrics data
      setMetrics({
        ctr: {
          current: 1.8,
          previous: 0.3,
          target: 2.5,
          trend: 'up'
        },
        indexing: {
          current: 28,
          target: 35,
          progress: 80,
          newlyIndexed: 7,
          crawlErrors: 2
        },
        coreWebVitals: {
          lcp: 2.1,
          fid: 85,
          cls: 0.08,
          score: 'good'
        },
        traffic: {
          organic: 15420,
          growth: 23.5,
          topKeywords: 42,
          avgPosition: 18.2
        },
        technical: {
          structuredData: 95,
          pagespeedScore: 78,
          mobileUsability: 98,
          sslScore: 100
        }
      });

      // Mock system health
      setSystemHealth({
        status: 'healthy',
        components: {
          cache: 'healthy',
          errorHandling: 'healthy',
          features: 'degraded'
        },
        errors: ['1 feature temporarily disabled'],
        recommendations: ['Monitor cache performance', 'Re-enable disabled features when stable']
      });

      // Mock alerts
      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'CTR Below Target',
          message: 'Current CTR (1.8%) is below target (2.5%). Consider optimizing meta descriptions.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          title: 'New Pages Indexed',
          message: '7 new pages have been successfully indexed by Google.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          resolved: true
        },
        {
          id: '3',
          type: 'critical',
          title: 'Crawl Errors Detected',
          message: '2 crawl errors found. Check sitemap and fix broken links.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          resolved: false
        }
      ]);

      setLastUpdated(new Date());
      setLoading(false);
    };

    loadDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setLoading(true);
    // Trigger data reload
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading SEO Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System Status: <strong className={getStatusColor(systemHealth.status)}>
              {systemHealth.status.toUpperCase()}
            </strong>
            {systemHealth.errors.length > 0 && (
              <span> - {systemHealth.errors.join(', ')}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CTR Card */}
            <Card>
              <CardHeader>
                <CardTitle>Click-Through Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.ctr.current}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {metrics?.ctr.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  {((metrics?.ctr.current || 0) - (metrics?.ctr.previous || 0)).toFixed(1)}% from last period
                </div>
                <Progress 
                  value={(metrics?.ctr.current || 0) / (metrics?.ctr.target || 1) * 100} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {metrics?.ctr.target}%
                </p>
              </CardContent>
            </Card>

            {/* Indexed Pages Card */}
            <Card>
              <CardHeader>
                <CardTitle>Indexed Pages</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.indexing.current}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  +{metrics?.indexing.newlyIndexed} new pages
                </div>
                <Progress 
                  value={metrics?.indexing.progress || 0} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {metrics?.indexing.target} pages
                </p>
              </CardContent>
            </Card>

            {/* Core Web Vitals Card */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant={metrics?.coreWebVitals.score === 'good' ? 'default' : 'destructive'}>
                    {metrics?.coreWebVitals.score?.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1 mt-2 text-xs">
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <span>{metrics?.coreWebVitals.lcp}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FID:</span>
                    <span>{metrics?.coreWebVitals.fid}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLS:</span>
                    <span>{metrics?.coreWebVitals.cls}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organic Traffic Card */}
            <Card>
              <CardHeader>
                <CardTitle>Organic Traffic</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.traffic.organic?.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  +{metrics?.traffic.growth}% growth
                </div>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Top 10 Keywords:</span>
                    <span>{metrics?.traffic.topKeywords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Position:</span>
                    <span>{metrics?.traffic.avgPosition}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          {systemHealth && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {getStatusIcon(systemHealth.status)}
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(systemHealth.components).map(([component, status]) => (
                    <div key={component} className="flex items-center justify-between p-3 border rounded">
                      <span className="capitalize">{component}</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className={`text-sm ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {systemHealth.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {systemHealth.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CTR Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current CTR</span>
                    <span className="font-bold">{metrics?.ctr.current}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Previous CTR</span>
                    <span>{metrics?.ctr.previous}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Target CTR</span>
                    <span>{metrics?.ctr.target}%</span>
                  </div>
                  <Progress 
                    value={(metrics?.ctr.current || 0) / (metrics?.ctr.target || 1) * 100} 
                    className="mt-4" 
                  />
                  <p className="text-sm text-muted-foreground">
                    {((metrics?.ctr.current || 0) / (metrics?.ctr.target || 1) * 100).toFixed(1)}% of target achieved
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Indexing Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Indexing Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Indexed Pages</span>
                    <span className="font-bold">{metrics?.indexing.current}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Target Pages</span>
                    <span>{metrics?.indexing.target}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Newly Indexed</span>
                    <span className="text-green-600">+{metrics?.indexing.newlyIndexed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Crawl Errors</span>
                    <span className="text-red-600">{metrics?.indexing.crawlErrors}</span>
                  </div>
                  <Progress 
                    value={metrics?.indexing.progress || 0} 
                    className="mt-4" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical SEO Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Structured Data</span>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics?.technical.structuredData || 0} className="w-20" />
                      <span className="font-bold">{metrics?.technical.structuredData}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>PageSpeed Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics?.technical.pagespeedScore || 0} className="w-20" />
                      <span className="font-bold">{metrics?.technical.pagespeedScore}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mobile Usability</span>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics?.technical.mobileUsability || 0} className="w-20" />
                      <span className="font-bold">{metrics?.technical.mobileUsability}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SSL Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics?.technical.sslScore || 0} className="w-20" />
                      <span className="font-bold">{metrics?.technical.sslScore}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Web Vitals Details */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Largest Contentful Paint (LCP)</span>
                    <div className="text-right">
                      <div className="font-bold">{metrics?.coreWebVitals.lcp}s</div>
                      <div className="text-xs text-muted-foreground">Target: &lt; 2.5s</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>First Input Delay (FID)</span>
                    <div className="text-right">
                      <div className="font-bold">{metrics?.coreWebVitals.fid}ms</div>
                      <div className="text-xs text-muted-foreground">Target: &lt; 100ms</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cumulative Layout Shift (CLS)</span>
                    <div className="text-right">
                      <div className="font-bold">{metrics?.coreWebVitals.cls}</div>
                      <div className="text-xs text-muted-foreground">Target: &lt; 0.1</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 border rounded">
                    <div className="text-center">
                      <Badge variant={metrics?.coreWebVitals.score === 'good' ? 'default' : 'destructive'}>
                        Overall Score: {metrics?.coreWebVitals.score?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 border rounded-lg ${alert.resolved ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={alert.type === 'critical' ? 'destructive' : 
                                           alert.type === 'warning' ? 'secondary' : 'default'}>
                              {alert.type}
                            </Badge>
                            {alert.resolved && (
                              <Badge variant="outline">Resolved</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEODashboard;