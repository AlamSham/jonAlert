import mongoose from 'mongoose';

const SEOConfigSchema = new mongoose.Schema(
  {
    pageType: {
      type: String,
      required: true,
      enum: ['detail', 'category', 'state', 'search', 'homepage'],
      index: true
    },
    category: {
      type: String,
      enum: ['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form', 'scheme', 'all'],
      default: 'all',
      index: true
    },
    titleTemplate: {
      type: String,
      required: true
    },
    descriptionTemplate: {
      type: String,
      required: true
    },
    keywords: {
      type: [String],
      default: []
    },
    emotionalTriggers: {
      type: [String],
      default: []
    },
    urgencyIndicators: {
      type: [String],
      default: []
    },
    hinglishTerms: {
      type: [String],
      default: []
    },
    abTestEnabled: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

// Compound index for efficient lookups
SEOConfigSchema.index({ pageType: 1, category: 1, isActive: 1 });

// Update the updatedAt field on save
SEOConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const SEOConfig = mongoose.model('SEOConfig', SEOConfigSchema);