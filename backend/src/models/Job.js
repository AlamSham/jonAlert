import mongoose from 'mongoose';
import { env } from '../config/env.js';

const ttlSeconds = Math.max(1, env.dbTtlDays) * 24 * 60 * 60;

const JobSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    eligibility: {
      type: String,
      required: true
    },
    importantDates: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form'],
      required: true,
      index: true
    },
    // --- New SEO & Traffic fields ---
    state: {
      type: String,
      default: 'All India',
      index: true
    },
    organization: {
      type: String,
      default: ''
    },
    vacancyCount: {
      type: Number,
      default: 0
    },
    lastDate: {
      type: Date,
      index: true
    },
    qualificationLevel: {
      type: String,
      enum: ['10th', '12th', 'graduate', 'post-graduate', 'diploma', 'iti', 'any', ''],
      default: ''
    },
    applyLink: {
      type: String,
      default: ''
    },
    salary: {
      type: String,
      default: ''
    },
    viewCount: {
      type: Number,
      default: 0
    },
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
    status: {
      type: String,
      enum: ['active', 'expired', 'upcoming'],
      default: 'active',
      index: true
    },
    // --- Existing fields ---
    sourceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    contentFingerprint: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    sourceUrl: {
      type: String,
      default: '',
      index: true
    },
    sourceName: {
      type: String,
      default: ''
    },
    publishedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: ttlSeconds }
    }
  },
  {
    versionKey: false
  }
);

// Text index for fast search
JobSchema.index({ title: 'text', content: 'text', summary: 'text' });

// Compound index for state + category filtering
JobSchema.index({ state: 1, category: 1 });

// Compound index for status + category
JobSchema.index({ status: 1, category: 1 });

export const Job = mongoose.model('Job', JobSchema);

