// SEO Core Interfaces and Types

export interface ContentData {
  title: string;
  category: string;
  state?: string;
  organization?: string;
  vacancyCount?: number;
  lastDate?: string;
  keywords: string[];
  content?: string;
  summary?: string;
  slug?: string;
  tags?: string[];
  qualificationLevel?: string;
  salary?: string;
  applyLink?: string;
  eligibility?: string;
  importantDates?: string;
}

export interface OptimizationContext {
  pageType: 'detail' | 'category' | 'state' | 'search';
  targetKeywords: string[];
  emotionalTriggers: string[];
  urgencyIndicators: string[];
  hinglishTerms: string[];
  location?: string;
  audience?: string;
}

export interface ABTestResult {
  winningVariation: string;
  ctrImprovement: number;
  confidenceLevel: number;
  testDuration: number;
  variations: string[];
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
}

export interface MetaTagSet {
  title: string;
  description: string;
  keywords: string[];
  robots: string;
  canonical: string;
  hreflang: HreflangTag[];
  openGraph: OpenGraphTags;
  twitterCard: TwitterCardTags;
}

export interface HreflangTag {
  hreflang: string;
  href: string;
}

export interface OpenGraphTags {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
  siteName: string;
  locale: string;
}

export interface TwitterCardTags {
  card: string;
  title: string;
  description: string;
  image?: string;
  site?: string;
}

export interface RobotsDirective {
  index: boolean;
  follow: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  maxSnippet?: number;
  maxImagePreview?: string;
}

export interface JobPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'JobPosting';
  title: string;
  description: string;
  datePosted?: string;
  hiringOrganization: Organization;
  jobLocation: Place;
  employmentType: string;
  validThrough?: string;
  baseSalary?: MonetaryAmount;
  qualifications?: string;
  totalJobOpenings?: number;
  directApply?: boolean;
  applicationContact?: ContactPoint;
  jobBenefits?: string;
}

export interface GovernmentServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'GovernmentService';
  name: string;
  description: string;
  serviceType: string;
  areaServed: string;
  provider: GovernmentOrganization;
  url: string;
  eligibility?: string;
  applicationDeadline?: string;
  fee?: MonetaryAmount;
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: FAQQuestion[];
}

export interface FAQQuestion {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint: ContactPoint[];
  foundingDate: string;
  areaServed: Place;
  serviceType: string;
  knowsAbout: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  richSnippetEligible: boolean;
  schemaType: string;
}

export interface TopicCluster {
  title: string;
  description: string;
  mainKeyword: string;
  relatedKeywords: string[];
  pages: Array<{ title: string; url: string; }>;
  priority: 'high' | 'medium' | 'low';
}

export interface InternalLink {
  text: string;
  url: string;
  anchor: string;
  relevanceScore: number;
}

export interface ContentOptimization {
  originalContent: string;
  optimizedContent: string;
  keywordDensity: number;
  readabilityScore: ReadabilityScore;
  suggestions: string[];
}

export interface ReadabilityScore {
  score: number;
  level: string;
  wordsCount: number;
  sentencesCount: number;
  avgWordsPerSentence: number;
  suggestions: string[];
}

export interface RelatedLink {
  url: string;
  title: string;
  description: string;
  category: string;
  relevanceScore: number;
}

export interface EnhancedContent {
  originalContent: string;
  enhancedContent: string;
  addedSections: ContentSection[];
  keywordDensity: number;
  readabilityScore: number;
  faqItems: FAQItem[];
  relatedLinks: RelatedLink[];
}

export interface ContentSection {
  type: 'faq' | 'howto' | 'comparison' | 'statistics' | 'related';
  title: string;
  content: string;
  keywords: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
}

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: SitemapImage[];
}

export interface SitemapImage {
  url: string;
  caption?: string;
  title?: string;
}

export interface IndexingStatus {
  url: string;
  status: 'indexed' | 'discovered' | 'crawled' | 'excluded' | 'error';
  lastCrawled?: Date;
  issues?: string[];
  coverageState?: string;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
  submittedUrls: string[];
  errors?: string[];
}

export interface IndexingResult {
  url: string;
  success: boolean;
  message: string;
  requestId?: string;
}

export interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  score: number;
  url: string;
  timestamp: Date;
}

export interface CTRMetrics {
  currentCTR: number;
  previousCTR: number;
  improvement: number;
  topPerformingPages: PageCTR[];
  underperformingPages: PageCTR[];
  period: string;
}

export interface PageCTR {
  url: string;
  title: string;
  ctr: number;
  impressions: number;
  clicks: number;
  position: number;
}

export interface SEOReport {
  generatedAt: Date;
  period: string;
  summary: {
    totalPages: number;
    indexedPages: number;
    averageCTR: number;
    totalClicks: number;
    totalImpressions: number;
    coreWebVitalsScore: number;
  };
  improvements: {
    ctrGrowth: number;
    indexingGrowth: number;
    trafficGrowth: number;
    rankingImprovements: number;
  };
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  affectedUrls: string[];
  solution: string;
}

export interface GSCData {
  indexedPages: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  averagePosition: number;
  topQueries: QueryData[];
  topPages: PageData[];
  crawlErrors: CrawlError[];
  coverageIssues: CoverageIssue[];
}

export interface QueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface PageData {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface CrawlError {
  url: string;
  errorType: string;
  firstDetected: Date;
  lastCrawled?: Date;
}

export interface CoverageIssue {
  url: string;
  issueType: string;
  status: string;
  firstDetected: Date;
}

export interface AlertThresholds {
  ctrDropBelow: number; // 1.5%
  indexedPagesBelow: number; // 30
  lcpAbove: number; // 3.0s
  clsAbove: number; // 0.15
  crawlErrorsAbove: number; // 10
  positionDropBelow: number; // 20
  trafficDropBelow: number; // -10%
}

export interface CompetitorAnalysis {
  competitor: string;
  metrics: {
    estimatedTraffic: number;
    topKeywords: string[];
    averagePosition: number;
    contentGaps: string[];
  };
  comparison: {
    trafficRatio: number;
    keywordOverlap: number;
    contentQualityScore: number;
  };
}

// Helper Types
export interface Organization {
  '@type': 'Organization';
  name: string;
  url?: string;
}

export interface GovernmentOrganization {
  '@type': 'GovernmentOrganization';
  name: string;
  url?: string;
}

export interface Place {
  '@type': 'Place';
  address?: PostalAddress;
  name?: string;
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  addressCountry: string;
  addressRegion?: string;
  addressLocality?: string;
  streetAddress?: string;
  postalCode?: string;
}

export interface MonetaryAmount {
  '@type': 'MonetaryAmount';
  currency: string;
  value: QuantitativeValue | number;
}

export interface QuantitativeValue {
  '@type': 'QuantitativeValue';
  value: number;
  minValue?: number;
  maxValue?: number;
  unitText?: string;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  contactType: string;
  url?: string;
  telephone?: string;
  email?: string;
  availableLanguage?: string[];
}

// Configuration Types
export interface SEOConfig {
  id: string;
  pageType: string;
  titleTemplate: string;
  descriptionTemplate: string;
  keywords: string[];
  emotionalTriggers: string[];
  urgencyIndicators: string[];
  hinglishTerms: string[];
  abTestEnabled: boolean;
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  id: string;
  url: string;
  date: Date;
  ctr: number;
  impressions: number;
  clicks: number;
  position: number;
  coreWebVitals: WebVitalsMetrics;
  indexingStatus: string;
  structuredDataValid: boolean;
}

export interface ContentEnhancement {
  id: string;
  pageUrl: string;
  originalContent: string;
  enhancedContent: string;
  addedSections: ContentSection[];
  faqItems: FAQItem[];
  relatedLinks: RelatedLink[];
  keywordDensity: number;
  readabilityScore: number;
  lastUpdated: Date;
}

// Error Types
export interface SEOError {
  component: string;
  operation: string;
  error: Error;
  context: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

// Cache Types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  keyPrefix: string;
}

export interface CachedSEOData {
  key: string;
  data: any;
  timestamp: Date;
  expiresAt: Date;
}

// Performance Monitor Types
export interface CoreWebVitalsMetrics {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score)
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
  timestamp: Date;
}

export interface CTRData {
  currentCTR: number;
  previousCTR: number;
  improvement: number;
  targetCTR: number;
  period: {
    start: Date;
    end: Date;
  };
  pageData: Array<{
    page: string;
    ctr: number;
    impressions: number;
    clicks: number;
  }>;
  lastUpdated: Date;
}

export interface IndexingProgress {
  indexedPages: number;
  previousIndexedPages: number;
  targetPages: number;
  newlyIndexed: number;
  deindexed: number;
  crawlErrors: number;
  period: {
    start: Date;
    end: Date;
  };
  pageTypes: {
    jobs: number;
    schemes: number;
    results: number;
    categories: number;
  };
  lastUpdated: Date;
}

export interface SEOMetrics {
  organicTraffic: {
    current: number;
    previous: number;
    growth: number;
  };
  keywordRankings: {
    topTen: number;
    topFifty: number;
    total: number;
    averagePosition: number;
  };
  technicalSEO: {
    structuredDataValid: number;
    crawlErrors: number;
    pagespeedScore: number;
    mobileUsability: number;
  };
  contentMetrics: {
    totalPages: number;
    optimizedPages: number;
    duplicateContent: number;
    thinContent: number;
  };
  lastUpdated: Date;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

export interface PerformanceReport {
  id: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  coreWebVitals: CoreWebVitalsMetrics;
  ctrData: CTRData;
  indexingProgress: IndexingProgress;
  seoMetrics: SEOMetrics;
  summary: string;
  recommendations: string[];
}
