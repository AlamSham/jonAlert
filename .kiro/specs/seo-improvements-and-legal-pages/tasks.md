# Implementation Plan: SEO Improvements and Legal Pages

## Overview

This implementation plan breaks down the SEO improvements and Cookie Policy page feature into discrete, actionable coding tasks. The plan follows a phased approach to ensure production stability while delivering measurable SEO improvements for sarkaripulse.net.

**Implementation Language**: TypeScript (Next.js 16 + React)

**Key Objectives**:
- Add Cookie Policy page and update footer with legal links
- Enhance SEO module with meta description generators and structured data
- Implement internal linking system for better discoverability
- Add new engagement components (FAQ, HowToApply, TrustSignals)
- Integrate analytics tracking for monitoring improvements
- Optimize performance and validate SEO compliance

## Tasks

- [x] 1. Create Cookie Policy page and update footer
  - [x] 1.1 Create Cookie Policy page component
    - Create `/frontend/src/app/cookie-policy/page.tsx` with Hinglish content
    - Include sections: Introduction, Cookies We Use, Third-Party Services, How to Disable, Your Choices, Contact
    - Add metadata with title "Cookie Policy — SarkariPulse" and meta description
    - Set canonical URL to `/cookie-policy`
    - Include "Last Updated" date field
    - Follow existing legal page design pattern (card layout, typography, spacing)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_
  
  - [x] 1.2 Update Footer component with legal links
    - Modify `/frontend/src/components/Footer.tsx`
    - Add "Legal" section to footer link groups
    - Include links: Privacy Policy, Cookie Policy, Disclaimer, About Us, Contact Us
    - Ensure mobile-responsive layout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 1.3 Add Cookie Policy to sitemap
    - Modify `/frontend/src/app/sitemap.ts`
    - Add Cookie Policy URL with priority 0.4-0.5
    - Set changeFrequency to "monthly"
    - Include lastModified timestamp
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 1.4 Test Cookie Policy page
    - Verify page renders correctly on desktop and mobile
    - Check all links navigate properly
    - Validate metadata in browser dev tools
    - Test responsive design on multiple screen sizes
    - _Requirements: 1.1-1.10, 2.1-2.5_

- [x] 2. Enhance SEO module with meta description generators
  - [x] 2.1 Implement job meta description generator
    - Add `generateJobMetaDescription()` function to `/frontend/src/lib/seo.ts`
    - Generate 150-160 character descriptions
    - Include: job title, organization, state, last date, CTA in Hinglish
    - Include vacancy count when available
    - Add error handling with fallback to existing metaDescription
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 2.2 Implement category meta description generator
    - Add `generateCategoryMetaDescription()` function to `/frontend/src/lib/seo.ts`
    - Generate unique descriptions for each category (jobs, admission, scholarship, result, admit-card, exam-form)
    - Include category-specific keywords
    - Include location keywords for state-specific pages
    - _Requirements: 3.7, 3.8_
  
  - [ ]* 2.3 Write unit tests for meta description generators
    - Create `/frontend/src/__tests__/lib/seo.test.ts`
    - Test description length validation (150-160 chars)
    - Test keyword inclusion
    - Test error handling and fallbacks
    - Test truncation logic
    - _Requirements: 3.1-3.8_

- [x] 3. Add structured data generators to SEO module
  - [x] 3.1 Implement FAQ schema generator
    - Add `generateFAQSchema()` function to `/frontend/src/lib/seo.ts`
    - Generate minimum 4 questions: eligibility, last date, application process, qualification
    - Add salary question conditionally when salary field exists
    - Return null if fewer than 2 questions available
    - Add error handling
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 3.2 Implement Article schema generator
    - Add `generateArticleSchema()` function to `/frontend/src/lib/seo.ts`
    - Include: headline, description, image, author, publisher, datePublished, dateModified
    - Use proper schema.org Article type
    - _Requirements: 4.4, 4.5_
  
  - [x] 3.3 Implement CollectionPage schema generator
    - Add `generateCollectionPageSchema()` function to `/frontend/src/lib/seo.ts`
    - Include numberOfItems field
    - Include ItemList with top items and position indexing
    - _Requirements: 19.1, 19.2_
  
  - [x] 3.4 Implement LocalBusiness schema generator
    - Add `generateLocalBusinessSchema()` function to `/frontend/src/lib/seo.ts`
    - Include addressRegion field for state
    - Include business information
    - _Requirements: 18.3_
  
  - [x] 3.5 Enhance existing schema generators
    - Update `jobPostingJsonLd()` to include all available fields (salary, location, employmentType, validThrough)
    - Update `organizationJsonLd()` to include social media links and contactPoint
    - Ensure `generateBreadcrumbSchema()` uses proper position indexing starting from 1
    - _Requirements: 4.6, 4.7, 4.8, 4.9_
  
  - [ ]* 3.6 Write unit tests for structured data generators
    - Add tests to `/frontend/src/__tests__/lib/seo.test.ts`
    - Test FAQ schema structure validation
    - Test Article schema completeness
    - Test CollectionPage schema with ItemList
    - Test breadcrumb position indexing
    - Validate against schema.org specifications
    - _Requirements: 4.1-4.9_


- [x] 4. Create internal linking utilities
  - [x] 4.1 Create internal links utility file
    - Create `/frontend/src/lib/internal-links.ts`
    - Define `InternalLink` interface with href, label, type, and optional count fields
    - _Requirements: 5.1-5.9_
  
  - [x] 4.2 Implement contextual link generators
    - Add `generateJobContextualLinks()` function to generate category, state, qualification, and tag links
    - Add `generateRelatedContentLinks()` function for related category, state, and tag-based links
    - Add `getQualificationLinks()` function for standard qualification links
    - Add `getTopStateLinks()` function for state links with counts
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.8_
  
  - [ ]* 4.3 Write unit tests for internal linking utilities
    - Create `/frontend/src/__tests__/lib/internal-links.test.ts`
    - Test link generation for various job types
    - Test state link encoding
    - Test qualification link accuracy
    - Test tag-based link generation
    - _Requirements: 5.1-5.9_

- [x] 5. Create new engagement components
  - [x] 5.1 Create FAQ accordion component
    - Create `/frontend/src/components/FAQ.tsx`
    - Define `FAQItem` and `FAQProps` interfaces
    - Implement accordion-style expandable/collapsible design
    - Support both "accordion" and "list" variants
    - Include FAQ schema in JSON-LD
    - Return null if no items provided
    - _Requirements: 6.5, 6.6_
  
  - [x] 5.2 Create HowToApply component
    - Create `/frontend/src/components/HowToApply.tsx`
    - Define `HowToApplyProps` interface with applyLink and title
    - Display 5-step application guide in Hinglish
    - Include: Visit website, Fill form, Upload documents, Pay fee, Submit and save receipt
    - _Requirements: 7.3_
  
  - [x] 5.3 Create ApplicationTips component
    - Create `/frontend/src/components/ApplicationTips.tsx`
    - Display 3-5 helpful tips in Hinglish
    - Include: Read notification, Check eligibility, Keep documents ready, Apply before deadline, Save receipt
    - _Requirements: 7.4_
  
  - [x] 5.4 Create TrustSignals component
    - Create `/frontend/src/components/TrustSignals.tsx`
    - Display "Why Choose SarkariPulse" section
    - Include: AI-Powered updates, Real-time alerts, 100% Free, Trusted source, 10-minute auto-updates
    - _Requirements: 7.2_
  
  - [x] 5.5 Create HowItWorks component
    - Create `/frontend/src/components/HowItWorks.tsx`
    - Display 3-step process visualization in Hinglish
    - Include: Browse (Latest notifications), Read (Complete details), Apply (Direct official links)
    - _Requirements: 7.1_
  
  - [ ]* 5.6 Write component tests
    - Create test files in `/frontend/src/__tests__/components/`
    - Test FAQ accordion functionality
    - Test HowToApply step rendering
    - Test component rendering on mobile and desktop
    - _Requirements: 7.1-7.4_

- [x] 6. Checkpoint - Verify core functionality
  - Ensure all tests pass
  - Verify Cookie Policy page is accessible
  - Verify meta description generators work correctly
  - Verify structured data generators produce valid JSON-LD
  - Ask the user if questions arise

- [x] 7. Enhance job detail pages with new components
  - [x] 7.1 Add FAQ section to job detail pages
    - Modify `/frontend/src/app/job/[slug]/page.tsx`
    - Import and use FAQ component
    - Generate FAQ items using `generateFAQSchema()` data
    - Include minimum 4 questions about eligibility, last date, application process, qualification
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 7.2 Add HowToApply and ApplicationTips sections
    - Modify `/frontend/src/app/job/[slug]/page.tsx`
    - Import HowToApply and ApplicationTips components
    - Display HowToApply when applyLink exists
    - Display ApplicationTips below job details
    - _Requirements: 7.3, 7.4_
  
  - [x] 7.3 Add internal links to job detail pages
    - Modify `/frontend/src/app/job/[slug]/page.tsx`
    - Use `generateJobContextualLinks()` to generate related links
    - Display links to category, state, qualification pages
    - Display tag-based links
    - _Requirements: 5.1, 5.2, 5.3, 5.8_
  
  - [x] 7.4 Update job detail page metadata
    - Use `generateJobMetaDescription()` for meta description
    - Use `generateArticleSchema()` for Article structured data
    - Use `generateFAQSchema()` for FAQ structured data
    - Ensure canonical URL is properly set
    - _Requirements: 3.1-3.6, 4.1-4.5, 13.2_
  
  - [x] 7.5 Add reading time and timestamps
    - Display estimated reading time using existing ReadingTime component
    - Display "Posted on" date prominently near title
    - Display "Last Updated" date when content is modified
    - Use relative time format for recent jobs (< 7 days)
    - Highlight "New" badge for jobs posted within last 24 hours
    - _Requirements: 7.8, 16.1, 16.2, 16.6, 16.7_

- [x] 8. Enhance homepage with engagement components
  - [x] 8.1 Add HowItWorks section to homepage
    - Modify `/frontend/src/app/page.tsx`
    - Import and add HowItWorks component
    - Place after hero section or before job listings
    - _Requirements: 7.1_
  
  - [x] 8.2 Add TrustSignals section to homepage
    - Modify `/frontend/src/app/page.tsx`
    - Import and add TrustSignals component
    - Place in prominent position (after HowItWorks or before footer)
    - _Requirements: 7.2_
  
  - [x] 8.3 Add internal links to homepage
    - Modify `/frontend/src/app/page.tsx`
    - Add links to all category pages with descriptive anchor text
    - Add links to top 10 states with job counts using `getTopStateLinks()`
    - _Requirements: 5.4, 5.5, 8.1, 8.2_
  
  - [x] 8.4 Optimize homepage keywords
    - Ensure H1 includes: "Sarkari Naukri", "Government Jobs", "Sarkari Result"
    - Ensure H2 tags include: "Latest Notifications", "Exam Results", "Admit Card"
    - Add "Last Updated" timestamp in footer
    - _Requirements: 8.1, 8.2, 16.3_

- [x] 9. Enhance category pages with structured data
  - [x] 9.1 Add CollectionPage schema to category pages
    - Modify `/frontend/src/app/jobs/page.tsx` and other category pages
    - Use `generateCollectionPageSchema()` to generate schema
    - Include numberOfItems and ItemList with top 10 jobs
    - _Requirements: 19.1, 19.2_
  
  - [x] 9.2 Add breadcrumb schema to category pages
    - Use `generateBreadcrumbSchema()` with proper hierarchy
    - Ensure position indexing starts from 1
    - _Requirements: 4.6, 4.7, 19.3_
  
  - [x] 9.3 Add FAQ section to category pages
    - Add category-specific FAQ questions
    - Use FAQ component with category-relevant questions
    - Include FAQ schema
    - _Requirements: 19.6_
  
  - [x] 9.4 Optimize category page metadata
    - Use `generateCategoryMetaDescription()` for meta descriptions
    - Include category-specific keywords in H1 and meta title
    - Add description section explaining the category
    - Add statistics: total items, update frequency, latest update
    - _Requirements: 3.7, 8.5, 19.4, 19.5_

- [x] 10. Enhance state-specific pages for local SEO
  - [x] 10.1 Update state page structure
    - Modify `/frontend/src/app/jobs/state/[state]/page.tsx` and similar state pages
    - Include state name in H1: "Sarkari Naukri in {State}"
    - Include state name in meta title and description
    - _Requirements: 18.1, 18.2_
  
  - [x] 10.2 Add LocalBusiness schema to state pages
    - Use `generateLocalBusinessSchema()` with state parameter
    - Include addressRegion field
    - _Requirements: 18.3_
  
  - [x] 10.3 Add state page content and links
    - Add breadcrumb: Home → Jobs → {State}
    - Add content section explaining job opportunities in that state
    - Add links to neighboring states
    - Add statistics: total jobs, latest job date, popular categories
    - _Requirements: 18.4, 18.5, 18.6, 18.7_
  
  - [x] 10.4 Ensure proper canonical URLs for state pages
    - Use properly encoded state name in canonical URL
    - _Requirements: 13.4, 18.8_


- [x] 11. Add FAQ sections to legal pages
  - [x] 11.1 Add FAQ to Privacy Policy page
    - Modify `/frontend/src/app/privacy-policy/page.tsx`
    - Import and use FAQ component
    - Add minimum 5 questions: data collection, cookie usage, unsubscribe process, data deletion, third-party services
    - Include FAQ schema
    - _Requirements: 6.1, 6.2, 6.6_
  
  - [x] 11.2 Add FAQ to About page
    - Modify `/frontend/src/app/about/page.tsx`
    - Import and use FAQ component
    - Add minimum 5 questions: update frequency, notification methods, free service, official affiliation, contact methods
    - Include FAQ schema
    - Add "Our Story" section explaining why SarkariPulse was created
    - _Requirements: 6.3, 6.4, 6.6, 7.5, 7.6_
  
  - [x] 11.3 Add FAQ to Contact page
    - Modify `/frontend/src/app/contact/page.tsx`
    - Import and use FAQ component
    - Add FAQ section before contact form
    - _Requirements: 7.7_
  
  - [x] 11.4 Add cross-links to legal pages
    - Add "Related Pages" section to all legal pages
    - Include links to other legal pages (Privacy Policy, Cookie Policy, Disclaimer, About, Contact)
    - _Requirements: 5.6_
  
  - [x] 11.5 Add "Last Updated" dates to legal pages
    - Add "Last Updated" timestamp at top of Privacy Policy, Cookie Policy, Disclaimer pages
    - _Requirements: 7.9, 16.4_

- [x] 12. Enhance error pages
  - [x] 12.1 Enhance 404 error page
    - Modify `/frontend/src/app/not-found.tsx`
    - Add search form to help users find content
    - Add links to popular categories (Jobs, Results, Admit Card)
    - Add links to recently posted jobs
    - Include Hinglish message explaining the error
    - Ensure noindex meta tag is set
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.6, 17.8_
  
  - [x] 12.2 Enhance 500 error page
    - Modify `/frontend/src/app/error.tsx`
    - Add contact link and apology message in Hinglish
    - Maintain consistent branding
    - _Requirements: 17.7, 17.8_

- [x] 13. Checkpoint - Verify page enhancements
  - Ensure all enhanced pages render correctly
  - Verify FAQ sections work on all pages
  - Verify internal links navigate properly
  - Verify structured data is present in page HTML
  - Ask the user if questions arise

- [x] 14. Create analytics tracking utilities
  - [x] 14.1 Create analytics utility file
    - Create `/frontend/src/lib/analytics.ts`
    - Implement `trackEvent()` function for custom GA events
    - Implement `trackInternalLinkClick()` for navigation tracking
    - Implement `trackScrollDepth()` for engagement tracking
    - Implement `trackApplyClick()` for conversion tracking
    - Implement `trackSearch()` for search behavior tracking
    - Implement `sendWebVitals()` for Core Web Vitals reporting
    - Add error handling to silently fail without breaking UX
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.8_
  
  - [ ]* 14.2 Write unit tests for analytics utilities
    - Create `/frontend/src/__tests__/lib/analytics.test.ts`
    - Test event tracking function calls
    - Test parameter validation
    - Mock GA integration
    - _Requirements: 15.1-15.8_

- [x] 15. Integrate analytics tracking into components
  - [x] 15.1 Add analytics to layout
    - Modify `/frontend/src/app/layout.tsx`
    - Import analytics utilities
    - Add Core Web Vitals reporting using `sendWebVitals()`
    - _Requirements: 15.8_
  
  - [x] 15.2 Add analytics to JobCard component
    - Modify `/frontend/src/components/JobCard.tsx`
    - Track "Apply Now" button clicks using `trackApplyClick()`
    - _Requirements: 15.3_
  
  - [x] 15.3 Add analytics to SearchForm component
    - Modify `/frontend/src/components/SearchForm.tsx`
    - Track search queries using `trackSearch()`
    - _Requirements: 15.5_
  
  - [x] 15.4 Add analytics to job detail pages
    - Modify `/frontend/src/app/job/[slug]/page.tsx`
    - Track scroll depth using `trackScrollDepth()`
    - Track internal link clicks using `trackInternalLinkClick()`
    - Track time-on-page
    - _Requirements: 15.2, 15.4, 15.7_
  
  - [x] 15.5 Add analytics to ShareButtons component
    - Modify `/frontend/src/components/ShareButtons.tsx`
    - Track social share button clicks
    - _Requirements: 15.6_

- [x] 16. Enhance sitemap with all pages
  - [x] 16.1 Add all legal pages to sitemap
    - Modify `/frontend/src/app/sitemap.ts`
    - Ensure Privacy Policy, Cookie Policy, Disclaimer, About, Contact are included
    - Set priority 0.4-0.5 for legal pages
    - Set changeFrequency to "monthly"
    - _Requirements: 11.1, 11.2, 11.5_
  
  - [x] 16.2 Add state-specific pages to sitemap
    - Add all state pages with jobs
    - Set appropriate priority (0.6-0.7)
    - Set changeFrequency to "daily"
    - _Requirements: 11.3_
  
  - [x] 16.3 Add qualification-specific pages to sitemap
    - Add qualification pages (10th, 12th, Graduate, Post Graduate, etc.)
    - Set appropriate priority and changeFrequency
    - _Requirements: 11.4_
  
  - [x] 16.4 Set proper sitemap metadata
    - Set changeFrequency: "hourly" for homepage, "daily" for jobs, "monthly" for legal
    - Set priority: 1.0 for homepage, 0.8-0.9 for categories, 0.7-0.8 for jobs
    - Include lastModified timestamp for all URLs
    - Ensure sitemap doesn't exceed 50,000 URLs
    - _Requirements: 11.5, 11.6, 11.7, 11.8_

- [x] 17. Implement canonical URL management
  - [x] 17.1 Ensure canonical URLs on all pages
    - Verify all pages include canonical URL in metadata
    - Use format: `https://sarkaripulse.net/job/{slug}` for job pages
    - Remove query parameters from canonical URLs for category pages
    - Use encoded state names for state pages
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 17.2 Add noindex to search results page
    - Modify `/frontend/src/app/search/page.tsx`
    - Add noindex meta tag to prevent indexing search results
    - _Requirements: 13.5_
  
  - [x] 17.3 Implement pagination link tags
    - Add rel="next" and rel="prev" link tags when pagination exists
    - _Requirements: 13.6_
  
  - [x] 17.4 Ensure HTTPS and consistent URL format
    - Verify all canonical URLs use HTTPS protocol
    - Ensure no trailing slashes (consistent format)
    - _Requirements: 13.7, 13.8_

- [x] 18. Implement Open Graph and Twitter Card optimization
  - [x] 18.1 Add Open Graph tags to job detail pages
    - Modify `/frontend/src/app/job/[slug]/page.tsx` metadata
    - Include og:image with job title and organization
    - Include og:type as "article" with published_time
    - Include og:locale as "hi_IN"
    - _Requirements: 12.1, 12.2, 12.8_
  
  - [x] 18.2 Add Twitter Card tags to job detail pages
    - Include twitter:card type "summary_large_image"
    - Include twitter:title optimized for social sharing
    - Include twitter:description (50-100 characters, action-oriented)
    - _Requirements: 12.3, 12.6, 12.7_
  
  - [x] 18.3 Add Open Graph tags to homepage
    - Modify `/frontend/src/app/page.tsx` metadata
    - Include og:image with SarkariPulse logo and tagline
    - Include og:locale as "hi_IN"
    - _Requirements: 12.4, 12.8_
  
  - [x] 18.4 Add Open Graph tags to category pages
    - Include category-specific og:image
    - _Requirements: 12.5_

- [x] 19. Implement search engine directives
  - [x] 19.1 Add robots meta tags to all pages
    - Ensure all pages include robots meta tag
    - Use "index, follow" for most pages
    - Use "noindex, follow" for search results
    - Use "index, follow" for pagination with canonical to page 1
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [x] 19.2 Update robots.txt
    - Modify `/frontend/src/app/robots.ts`
    - Allow all crawlers to access all pages except /api/
    - Include sitemap URL
    - _Requirements: 20.6, 20.7_
  
  - [x] 19.3 Add X-Robots-Tag header for API routes
    - Add "noindex, nofollow" header for API routes
    - _Requirements: 20.8_

- [x] 20. Checkpoint - Verify SEO implementation
  - Ensure all structured data validates in Google Rich Results Test
  - Verify canonical URLs are correct on all pages
  - Verify robots meta tags are properly set
  - Verify sitemap includes all pages
  - Ask the user if questions arise


- [x] 21. Implement accessibility and semantic HTML improvements
  - [x] 21.1 Ensure semantic HTML5 elements
    - Review all pages to use proper semantic elements (header, nav, main, article, section, footer)
    - Ensure proper heading hierarchy (H1 → H2 → H3) without skipping levels
    - _Requirements: 14.1, 14.3_
  
  - [x] 21.2 Add descriptive alt text to images
    - Review all images and ensure descriptive alt text
    - Use Next.js Image component for all images
    - _Requirements: 14.2, 10.6_
  
  - [x] 21.3 Add ARIA labels and form labels
    - Add ARIA labels for icon-only buttons
    - Ensure all forms have associated labels
    - Add skip-to-content link for keyboard navigation
    - _Requirements: 14.4, 14.5, 14.6_
  
  - [x] 21.4 Ensure color contrast and language attributes
    - Verify color contrast ratio meets WCAG AA standards (4.5:1)
    - Add lang="hi" attribute in HTML tag
    - _Requirements: 14.7, 14.8_

- [x] 22. Implement mobile SEO optimizations
  - [x] 22.1 Ensure mobile-friendly design
    - Verify all pages pass Google Mobile-Friendly Test
    - Ensure tap targets are minimum 48x48 pixels
    - Avoid horizontal scrolling on mobile devices
    - Use legible font sizes (minimum 16px for body text)
    - _Requirements: 9.1, 9.4, 9.5, 9.6_
  
  - [x] 22.2 Implement responsive images
    - Use responsive images with appropriate srcset attributes
    - Implement lazy loading for images below the fold
    - _Requirements: 9.2, 9.3_
  
  - [x] 22.3 Ensure mobile viewport configuration
    - Verify mobile viewport meta tag is properly configured
    - Make Table of Contents collapsible on mobile devices
    - _Requirements: 9.7, 9.8_

- [x] 23. Implement performance optimizations
  - [x] 23.1 Implement font preloading
    - Modify `/frontend/src/app/layout.tsx`
    - Add font preloading for Inter font family
    - _Requirements: 10.4_
  
  - [x] 23.2 Optimize JavaScript bundle
    - Implement code splitting for large components
    - Minimize JavaScript bundle size
    - _Requirements: 10.5_
  
  - [x] 23.3 Defer non-critical scripts
    - Defer OneSignal and Analytics scripts
    - Ensure critical rendering path is optimized
    - _Requirements: 10.8_
  
  - [x] 23.4 Verify ISR configuration
    - Ensure all dynamic pages use ISR with revalidate: 60
    - _Requirements: 10.7_
  
  - [ ]* 23.5 Run Lighthouse performance audits
    - Run Lighthouse on homepage and key pages
    - Verify Performance score > 90
    - Verify FCP < 1.5 seconds
    - Verify LCP < 2.5 seconds
    - Fix any performance issues identified
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 24. Implement keyword optimization
  - [x] 24.1 Optimize homepage keywords
    - Verify H1 includes: "Sarkari Naukri", "Government Jobs", "Sarkari Result"
    - Verify H2 tags include: "Latest Notifications", "Exam Results", "Admit Card"
    - _Requirements: 8.1, 8.2_
  
  - [x] 24.2 Optimize job detail page keywords
    - Ensure job category keyword appears in first 100 words
    - Ensure location keyword (state name) appears in first 100 words when state exists
    - _Requirements: 8.3, 8.4_
  
  - [x] 24.3 Optimize category page keywords
    - Include category-specific long-tail keywords in meta title and H1
    - _Requirements: 8.5_
  
  - [x] 24.4 Optimize About page keywords
    - Include keywords: "AI-powered", "real-time updates", "government jobs portal"
    - _Requirements: 8.6_
  
  - [x] 24.5 Ensure natural keyword density
    - Review all pages to ensure keyword density remains natural (1-2%)
    - Avoid keyword stuffing
    - _Requirements: 8.7, 8.8_

- [x] 25. Implement content freshness signals
  - [x] 25.1 Add timestamps to job detail pages
    - Display "Posted on" date prominently near title
    - Display "Last Updated" date when content is modified
    - Use relative time format for recent jobs (< 7 days)
    - Highlight "New" badge for jobs posted within last 24 hours
    - _Requirements: 16.1, 16.2, 16.6, 16.7_
  
  - [x] 25.2 Add timestamps to other pages
    - Add "Last Updated" timestamp to homepage footer
    - Add "Last Updated" date to legal pages
    - _Requirements: 16.3, 16.4_
  
  - [x] 25.3 Update Article schema with dateModified
    - Include dateModified field in Article schema when content is updated
    - _Requirements: 16.5_
  
  - [x] 25.4 Ensure proper sorting on category pages
    - Sort jobs by createdAt date in descending order by default
    - _Requirements: 16.8_

- [x] 26. Final testing and validation
  - [ ]* 26.1 Run Google Rich Results Test
    - Test all structured data types (JobPosting, Article, FAQ, CollectionPage, LocalBusiness, Breadcrumb)
    - Fix any validation errors
    - _Requirements: 4.1-4.9, 19.1-19.6_
  
  - [ ]* 26.2 Run Google Mobile-Friendly Test
    - Test homepage and key pages
    - Fix any mobile usability issues
    - _Requirements: 9.1-9.8_
  
  - [ ]* 26.3 Run Lighthouse SEO audit
    - Verify SEO score > 95 for all key pages
    - Fix any SEO issues identified
    - _Requirements: All SEO requirements_
  
  - [ ]* 26.4 Validate sitemap
    - Submit sitemap to Google Search Console
    - Verify all URLs are accessible
    - _Requirements: 11.1-11.8_
  
  - [ ]* 26.5 Test analytics tracking
    - Verify all analytics events fire correctly in GA
    - Test apply clicks, search queries, scroll depth, internal link clicks
    - _Requirements: 15.1-15.8_
  
  - [ ]* 26.6 Cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge
    - Verify all functionality works across browsers
    - _Requirements: All requirements_
  
  - [ ]* 26.7 Accessibility audit
    - Run accessibility audit using Lighthouse or axe DevTools
    - Fix any accessibility issues
    - _Requirements: 14.1-14.8_

- [x] 27. Production deployment preparation
  - [x] 27.1 Review all changes in development
    - Verify all tests pass
    - Verify no console errors or warnings
    - Verify ISR revalidation working (60 seconds)
    - _Requirements: All requirements_
  
  - [x] 27.2 Create deployment checklist
    - Document all changes made
    - Create rollback plan
    - Prepare monitoring checklist
    - _Requirements: All requirements_
  
  - [x] 27.3 Deploy to production
    - Deploy via Vercel Git integration
    - Monitor deployment logs
    - Verify all pages are accessible
    - _Requirements: All requirements_
  
  - [x] 27.4 Post-deployment verification
    - Submit updated sitemap to Google Search Console
    - Request indexing for Cookie Policy page
    - Verify analytics events are firing
    - Monitor Core Web Vitals in Search Console
    - _Requirements: All requirements_

- [x] 28. Final checkpoint - Production verification
  - Verify Cookie Policy page is live and accessible
  - Verify all legal links in footer work
  - Verify structured data validates in Google Rich Results Test
  - Verify analytics tracking is working
  - Monitor for any errors or issues
  - Document success metrics baseline for future comparison

## Notes

- Tasks marked with `*` are optional testing and validation tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for user feedback
- All changes maintain existing ISR configuration (revalidate: 60)
- All new content uses Hinglish language consistent with existing pages
- Production deployment should be done carefully with monitoring

## Success Metrics

Track these metrics after deployment:

- **Indexed Pages**: Target 35+ pages within 30 days (baseline: 21 pages)
- **CTR**: Target 2%+ within 60 days (baseline: 0.4%)
- **Average Position**: Target top 3 within 90 days (baseline: 4.1)
- **Bounce Rate**: Target 20% reduction within 60 days
- **Page Load Time**: Maintain LCP < 2.5 seconds
- **Rich Snippets**: Target 50%+ of job pages within 60 days
- **Mobile Usability**: Zero issues in Google Search Console

## Implementation Timeline

- **Week 1**: Tasks 1-6 (Cookie Policy, SEO module, internal linking, components)
- **Week 2**: Tasks 7-13 (Page enhancements, analytics)
- **Week 3**: Tasks 14-20 (Analytics integration, sitemap, canonical URLs, Open Graph)
- **Week 4**: Tasks 21-25 (Accessibility, mobile SEO, performance, keywords, freshness)
- **Week 5**: Tasks 26-28 (Testing, validation, deployment)
