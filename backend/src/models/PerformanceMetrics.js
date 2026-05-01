import mongoose from 'mongoose';

const PerformanceMetricsSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      index: true
    },
    pageType: {
      type: String,
      enum: ['detail', 'category', 'state', 'search', 'homepage'],
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form', 'scheme'],
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    // CTR Metrics
    ctr: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    position: {
      type: Number,
      default: 0,
      min: 0
    },
    // Core Web Vitals
    coreWebVitals: {
      lcp: {
        type: Number,
        default: 0 // Largest Contentful Paint (seconds)
      },
      fid: {
        type: Number,
        default: 0 // First Input Delay (milliseconds)
      },
      cls: {
        type: Number,
        default: 0 // Cumulative Layout Shift
      },
      fcp: {
        type: Number,
        default: 0 // First Contentful Paint (seconds)
      },
      ttfb: {
        type: Number,
        default: 0 // Time to First Byte (milliseconds)
      },
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    // SEO Status
    indexingStatus: {
      type: String,
      enum: ['indexed', 'discovered', 'crawled', 'excluded', 'error', 'unknown'],
      default: 'unknown',
      index: true
    },
    structuredDataValid: {
      type: Boolean,
      default: false
    },
    // Additional Metrics
    organicTraffic: {
      type: Number,
      default: 0,
      min: 0
    },
    bounceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    avgSessionDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    // Metadata
    source: {
      type: String,
      enum: ['gsc', 'analytics', 'lighthouse', 'manual'],
      default: 'manual'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

// Compound indexes for efficient queries
PerformanceMetricsSchema.index({ url: 1, date: -1 });
PerformanceMetricsSchema.index({ pageType: 1, category: 1, date: -1 });
PerformanceMetricsSchema.index({ date: -1, ctr: -1 });
PerformanceMetricsSchema.index({ indexingStatus: 1, date: -1 });

// TTL index to automatically delete old metrics (keep 1 year)
PerformanceMetricsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const PerformanceMetrics = mongoose.model('PerformanceMetrics', PerformanceMetricsSchema);