import mongoose from 'mongoose';

const ContentSectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['faq', 'howto', 'comparison', 'statistics', 'related'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  keywords: {
    type: [String],
    default: []
  }
}, { _id: false });

const FAQItemSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: ''
  },
  keywords: {
    type: [String],
    default: []
  }
}, { _id: false });

const RelatedLinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  relevanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  }
}, { _id: false });

const ContentEnhancementSchema = new mongoose.Schema(
  {
    pageUrl: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    pageType: {
      type: String,
      enum: ['detail', 'category', 'state', 'search'],
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form', 'scheme'],
      index: true
    },
    originalContent: {
      type: String,
      required: true
    },
    enhancedContent: {
      type: String,
      required: true
    },
    addedSections: {
      type: [ContentSectionSchema],
      default: []
    },
    faqItems: {
      type: [FAQItemSchema],
      default: []
    },
    relatedLinks: {
      type: [RelatedLinkSchema],
      default: []
    },
    // Content Quality Metrics
    keywordDensity: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    readabilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    wordCount: {
      type: Number,
      default: 0,
      min: 0
    },
    // SEO Metrics
    targetKeywords: {
      type: [String],
      default: []
    },
    hinglishTermsUsed: {
      type: [String],
      default: []
    },
    internalLinksAdded: {
      type: Number,
      default: 0,
      min: 0
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    },
    // Metadata
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    lastOptimizedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

// Compound indexes for efficient queries
ContentEnhancementSchema.index({ pageType: 1, category: 1, isActive: 1 });
ContentEnhancementSchema.index({ updatedAt: -1 });
ContentEnhancementSchema.index({ keywordDensity: -1, readabilityScore: -1 });

// Update the updatedAt field on save
ContentEnhancementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ContentEnhancement = mongoose.model('ContentEnhancement', ContentEnhancementSchema);