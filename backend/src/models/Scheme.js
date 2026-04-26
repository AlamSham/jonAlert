import mongoose from 'mongoose';

const SchemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    schemeType: {
      type: String,
      enum: ['central', 'state'],
      required: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      default: 'All India',
      index: true
    },
    launchDate: {
      type: Date
    },
    department: {
      type: String,
      default: ''
    },
    // Eligibility and Benefits
    eligibility: {
      type: String,
      required: true
    },
    benefits: {
      type: String,
      required: true
    },
    applicationProcess: {
      type: String,
      required: true
    },
    // Links and Resources
    applyLink: {
      type: String,
      default: ''
    },
    officialWebsite: {
      type: String,
      default: ''
    },
    helplineNumber: {
      type: String,
      default: ''
    },
    // SEO and Metadata
    metaTitle: {
      type: String,
      default: ''
    },
    metaDescription: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    // Analytics
    viewCount: {
      type: Number,
      default: 0
    },
    // Timestamps
    lastVerified: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Text index for full-text search
SchemeSchema.index({ title: 'text', description: 'text', summary: 'text' });

// Compound index for schemeType + state filtering
SchemeSchema.index({ schemeType: 1, state: 1 });

export const Scheme = mongoose.model('Scheme', SchemeSchema);
