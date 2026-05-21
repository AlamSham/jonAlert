import mongoose from 'mongoose';

const SitemapCacheSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    entryCount: {
      type: Number,
      required: true,
      default: 0
    },
    lastJobUpdate: {
      type: Date,
      default: null
    },
    lastSchemeUpdate: {
      type: Date,
      default: null
    }
  },
  {
    versionKey: false
  }
);

// TTL index on expiresAt for automatic cleanup
// MongoDB will automatically delete documents when expiresAt is reached
SitemapCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SitemapCache = mongoose.model('SitemapCache', SitemapCacheSchema);
