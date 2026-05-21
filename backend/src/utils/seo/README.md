# SEO Utilities - Complete Implementation Guide

This directory contains all SEO-related utilities for the SarkariPulse application, implementing comprehensive SEO best practices for improved search engine visibility.

## 📁 Module Overview

### Core Utilities

#### 1. **metaGenerator.js**
Generates optimized meta tags with automatic length validation.

**Functions:**
- `generateMetaTags(options)` - Generic meta tag generator
- `generateJobMetaTags(job)` - Job-specific meta tags
- `generateSchemeMetaTags(scheme)` - Scheme-specific meta tags
- `generateStaticPageMetaTags(pageName)` - Static page meta tags
- `generateCategoryMetaTags(category, filters)` - Category page meta tags with filters

**Features:**
- ✅ Title validation (50-60 characters)
- ✅ Description validation (150-160 characters)
- ✅ Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- ✅ Twitter Card tags
- ✅ Canonical URL integration
- ✅ Keywords extraction

#### 2. **structuredDataGenerator.js**
Generates valid JSON-LD structured data for rich search results.

**Functions:**
- `generateJobPostingSchema(job)` - JobPosting structured data
- `generateFAQSchema(faqs)` - FAQ structured data
- `generateBreadcrumbSchema(breadcrumbs)` - BreadcrumbList structured data
- `generateOrganizationSchema()` - Organization structured data
- `generateWebSiteSchema()` - WebSite structured data with search action

**Features:**
- ✅ Complete Schema.org compliance
- ✅ Intelligent fallback values (salary, address)
- ✅ Automatic validation integration
- ✅ Support for missing optional fields

#### 3. **schemaValidator.js**
Validates structured data against Schema.org specifications.

**Functions:**
- `validateJobPostingSchema(schema)` - Validate JobPosting
- `validateFAQSchema(schema)` - Validate FAQ
- `validateBreadcrumbSchema(schema)` - Validate BreadcrumbList
- `validateSchema(schema, schemaType)` - Generic validator
- `checkRequiredFields(schema, fields)` - Check required fields
- `validateFieldTypes(schema, types)` - Validate data types

**Features:**
- ✅ Required field validation
- ✅ Data type checking
- ✅ Nested field support (dot notation)
- ✅ Separate errors and warnings

#### 4. **urlManager.js**
Manages canonical URLs, slug generation, and URL normalization.

**Functions:**
- `generateSlug(title, options)` - Generate SEO-friendly slugs
- `normalizeUrl(url)` - Normalize URL format
- `getCanonicalUrl(path, options)` - Generate canonical URLs
- `buildJobUrl(job)` - Build job posting URLs
- `buildSchemeUrl(scheme)` - Build scheme URLs
- `buildCategoryUrl(category, filters)` - Build category URLs with filters

**Features:**
- ✅ Stop word removal
- ✅ Special character handling
- ✅ Length constraints (max 100 chars)
- ✅ Query parameter support

#### 5. **sitemapGenerator.js**
Generates dynamic XML sitemaps from database content.

**Functions:**
- `generateSitemap()` - Complete sitemap XML
- `generateJobSitemapEntries()` - Job entries
- `generateSchemeSitemapEntries()` - Scheme entries
- `generateStaticPageSitemapEntries()` - Static page entries
- `formatSitemapEntry(entry)` - XML formatting

**Features:**
- ✅ Optimized database queries (projection, lean)
- ✅ Proper XML escaping
- ✅ lastmod, changefreq, priority support
- ✅ Limit to 10,000 jobs, 5,000 schemes

#### 6. **robotsGenerator.js**
Generates robots.txt with proper directives.

**Functions:**
- `generateRobotsTxt()` - Complete robots.txt content

**Features:**
- ✅ Allow all user agents
- ✅ Disallow /api/, /admin/, /private/
- ✅ Sitemap reference
- ✅ Optional crawl-delay

## 🚀 Usage Examples

### Generate Job Meta Tags
```javascript
import { generateJobMetaTags } from './utils/seo/metaGenerator.js';

const job = {
  title: 'Railway Recruitment 2024',
  organization: 'Indian Railways',
  state: 'All India',
  summary: 'Apply for railway jobs...',
  vacancyCount: 5000,
  lastDate: new Date('2024-12-31'),
  status: 'active',
  slug: 'railway-recruitment-2024'
};

const metaTags = generateJobMetaTags(job);
// Returns: { title, description, canonical, openGraph, twitter, robots, keywords }
```

### Generate JobPosting Structured Data
```javascript
import { generateJobPostingSchema } from './utils/seo/structuredDataGenerator.js';

const schema = generateJobPostingSchema(job);
// Returns complete JobPosting JSON-LD with all required fields
```

### Validate Structured Data
```javascript
import { validateJobPostingSchema } from './utils/seo/schemaValidator.js';

const validation = validateJobPostingSchema(schema);
// Returns: { valid: boolean, errors: [], warnings: [], schemaType: 'JobPosting' }
```

### Generate Sitemap
```javascript
import { generateSitemap } from './utils/seo/sitemapGenerator.js';

const sitemapXml = await generateSitemap();
// Returns complete XML sitemap with all entries
```

## 🔧 Integration

### Middleware Setup (app.js)
```javascript
import { redirectMiddleware } from './middleware/redirect.js';
import { seoMiddleware } from './middleware/seo.js';

// Apply in correct order:
app.use(redirectMiddleware);  // Before body parsers
app.use(express.json());
app.use(seoMiddleware);        // After body parsers, before routes
```

### Route Integration
```javascript
import seoRouter from './routes/seo.routes.js';

app.use('/', seoRouter);  // Mounts /sitemap.xml, /robots.txt, static pages
```

### Controller Integration
```javascript
import { addJobSEO } from './utils/seoHelper.js';

export const getJobBySlug = async (req, res) => {
  const job = await Job.findOne({ slug: req.params.slug });
  const jobWithSEO = addJobSEO(job);
  res.json({ data: jobWithSEO });
};
```

## 📊 Caching

### In-Memory Cache
```javascript
import { cacheJobStructuredData, getCachedJobStructuredData } from './utils/cache.js';

// Cache structured data
cacheJobStructuredData(job._id, structuredData);

// Retrieve from cache
const cached = getCachedJobStructuredData(job._id);
```

**Cache TTLs:**
- Sitemap: 1 hour (3600s)
- Structured Data: 1 hour (3600s)
- Meta Tags: 30 minutes (1800s)

## 🧪 Testing

Each module has comprehensive test coverage:
- `metaGenerator.test.js` - 40+ test cases
- `urlManager.test.js` - 25+ test cases
- `structuredDataGenerator.test.js` - 42 assertions

Run tests:
```bash
npm test
```

## 📋 Requirements Mapping

This implementation satisfies all requirements from the SEO Indexing Fixes specification:

**Requirement 1**: Homepage redirect issues ✅
**Requirement 2**: Page indexing (sitemap, robots.txt) ✅
**Requirement 3**: JobPosting structured data ✅
**Requirement 4**: FAQ structured data ✅
**Requirement 5**: Meta tags ✅
**Requirement 6**: Robots.txt ✅
**Requirement 7**: Static page routes ✅
**Requirement 8**: Structured data validation ✅
**Requirement 9**: Canonical URL management ✅
**Requirement 10**: SEO-friendly URLs ✅
**Requirement 11**: Breadcrumb structured data ✅
**Requirement 12**: Performance optimization ✅

## 🔍 Google Search Console Integration

### Sitemap Submission
1. Access sitemap at: `https://sarkaripulse.net/sitemap.xml`
2. Submit to Google Search Console
3. Monitor indexing status

### Rich Results Testing
1. Use Google Rich Results Test: https://search.google.com/test/rich-results
2. Test job posting URLs
3. Verify structured data validity

### URL Inspection
1. Use URL Inspection Tool in GSC
2. Verify canonical URLs
3. Check meta tags and structured data

## 🚨 Troubleshooting

### Common Issues

**Issue**: Sitemap not generating
- Check database connection
- Verify Job/Scheme models are accessible
- Check SitemapCache model

**Issue**: Structured data validation errors
- Enable validation: `ENABLE_SEO_VALIDATION=true`
- Check console logs for detailed errors
- Use Schema Validator to identify issues

**Issue**: Meta tags too short/long
- Validator automatically adjusts lengths
- Check title (50-60 chars) and description (150-160 chars)
- Provide custom metaTitle/metaDescription if needed

## 📝 Environment Variables

Required in `.env`:
```
BASE_URL=https://sarkaripulse.net
SITEMAP_CACHE_TTL=3600
STRUCTURED_DATA_CACHE_TTL=3600
META_TAG_CACHE_TTL=1800
ENABLE_SEO_VALIDATION=true
```

## 🎯 Performance Targets

- Homepage: < 500ms
- Job detail page: < 800ms
- Sitemap generation: < 2s
- Structured data generation: < 100ms
- Meta tag generation: < 50ms

## 📚 Resources

- [Schema.org JobPosting](https://schema.org/JobPosting)
- [Schema.org FAQ](https://schema.org/FAQPage)
- [Schema.org BreadcrumbList](https://schema.org/BreadcrumbList)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

## 🔄 Maintenance

### Regular Tasks
- Monitor cache hit rates
- Check GSC for indexing errors
- Validate structured data monthly
- Update sitemap after bulk content changes
- Review meta tag performance

### Cache Management
```javascript
import { getCacheStats } from './utils/cache.js';

// Get cache statistics
const stats = getCacheStats();
console.log(stats);
// { structuredData: { size, hits, misses, hitRate }, metaTags: { ... } }
```

## ✅ Deployment Checklist

Before deploying:
- [ ] All environment variables configured
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Robots.txt accessible at /robots.txt
- [ ] Canonical URLs verified
- [ ] Meta tag lengths validated
- [ ] Structured data tested with Google Rich Results Test
- [ ] Redirects tested (http→https, www→non-www)
- [ ] Cache TTLs configured
- [ ] Error logging enabled

---

**Implementation Status**: ✅ Complete
**Last Updated**: 2024
**Version**: 1.0.0
