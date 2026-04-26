# Implementation Plan: Government Schemes Section

## Overview

This implementation plan breaks down the Government Schemes feature into discrete coding tasks. The feature adds a comprehensive schemes section to SarkariPulse.net, following established patterns from the jobs/results features. Implementation will proceed in phases: backend setup, frontend pages, components, integration, and testing.

## Tasks

- [x] 1. Set up backend infrastructure for schemes
  - [x] 1.1 Create Scheme MongoDB model with validation
    - Create `backend/src/models/Scheme.js` with schema (title, slug, description, summary, schemeType, state, eligibility, benefits, applicationProcess, etc.)
    - Add indexes: slug (unique), schemeType, state, tags, text index on title/description/summary
    - Add timestamps and viewCount field
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 1.2 Create scheme controller with all endpoints
    - Create `backend/src/controllers/scheme.controller.js`
    - Implement `getSchemes()` with pagination and filtering
    - Implement `getSchemeBySlug()` with viewCount increment
    - Implement `getSchemesByType()` for central/state filtering
    - Implement `getSchemesByState()` for state-specific queries
    - Implement `searchSchemes()` with text search
    - Implement `getRelatedSchemes()` based on type, state, tags
    - Implement `getLatestSchemes()` for homepage
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 1.3 Create scheme service layer
    - Create `backend/src/services/scheme.service.js`
    - Implement slug generation utility (handle duplicates, special characters)
    - Implement related schemes algorithm (by state, type, tags)
    - Implement search query sanitization
    - _Requirements: 5.1, 5.2, 6.2_

  - [x] 1.4 Set up scheme API routes with validation
    - Create `backend/src/routes/scheme.routes.js`
    - Define routes: GET /schemes, GET /schemes/:slug, GET /schemes/type/:type, GET /schemes/state/:state, GET /schemes/search, GET /schemes/:slug/related
    - Add validation middleware for query parameters
    - Create `backend/src/validators/scheme.validator.js` for request validation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.5 Register scheme routes in Express app
    - Import scheme routes in `backend/src/app.js`
    - Mount routes at `/api/schemes`
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ]* 1.6 Write unit tests for backend scheme logic
    - Test Scheme model validation (required fields, enums, defaults)
    - Test controller functions (pagination, filtering, search)
    - Test slug generation utility
    - Test related schemes algorithm
    - _Requirements: All backend requirements_

- [x] 2. Create and seed MVP scheme data
  - [x] 2.1 Create seed data file with 15 MVP schemes
    - Create `backend/src/data/schemes.seed.json`
    - Add 5 central schemes (PM Kisan, Ayushman Bharat, PM Awas, Mudra, Sukanya Samriddhi)
    - Add 5 Jharkhand state schemes (Mukhyamantri Samman, Savitribai Phule Kishori, Krishi Ashirwad, Birsa Harit Gram, Guruji Credit Card)
    - Add 5 additional popular schemes (Fasal Bima, Atal Pension, Ujjwala, Beti Bachao, Stand Up India)
    - Include all required fields: title, slug, description, summary, schemeType, state, eligibility, benefits, applicationProcess
    - Include optional fields where available: applyLink, officialWebsite, helplineNumber, thumbnailUrl, department, launchDate, tags
    - _Requirements: 1.1, 1.4, 2.1, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

  - [x] 2.2 Create database seeding script
    - Create `backend/src/scripts/seedSchemes.js`
    - Read schemes from seed data file
    - Insert schemes into MongoDB (handle duplicates)
    - Log success/failure for each scheme
    - _Requirements: 1.1, 1.4, 2.1, 2.4_

  - [x] 2.3 Run seeding script and verify data
    - Execute seeding script: `node backend/src/scripts/seedSchemes.js`
    - Verify all 15 schemes inserted successfully
    - Test API endpoints manually to confirm data retrieval
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Checkpoint - Backend validation
  - Ensure all backend tests pass, verify API endpoints return correct data, ask the user if questions arise.

- [x] 4. Create frontend type definitions and API client
  - [x] 4.1 Add scheme types to type definitions
    - Update `frontend/src/lib/types.ts`
    - Add `SchemeType = 'central' | 'state'`
    - Add `SchemeListItem` interface (title, slug, summary, schemeType, state, department, thumbnailUrl, tags, viewCount, createdAt)
    - Add `SchemeDetail` interface (extends SchemeListItem with description, launchDate, eligibility, benefits, applicationProcess, applyLink, officialWebsite, helplineNumber, metaTitle, metaDescription, lastVerified)
    - Add `SchemeFilters` interface (schemeType, state, search)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Implement scheme API client functions
    - Update `frontend/src/lib/api.ts`
    - Implement `getSchemes(page, limit, filters)` with query parameter construction
    - Implement `getSchemeBySlug(slug)` with error handling
    - Implement `getSchemesByState(state, page, limit)`
    - Implement `searchSchemes(query)` with URL encoding
    - Implement `getRelatedSchemes(slug)`
    - Implement `getLatestSchemes(limit)` for homepage
    - Add proper error handling (404, network errors)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 5.1, 5.2, 5.5, 5.6_

  - [ ]* 4.3 Write unit tests for API client functions
    - Test query parameter construction
    - Test error handling (404, network failures)
    - Test response parsing
    - Mock fetch calls
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 5. Build scheme listing page
  - [x] 5.1 Create schemes listing page component
    - Create `frontend/src/app/schemes/page.tsx`
    - Implement server-side data fetching with `getSchemes()`
    - Add pagination support from query params
    - Implement grid layout (1/2/3 columns responsive)
    - Add loading state
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 7.1_

  - [x] 5.2 Add SEO metadata generation for listing page
    - Implement `generateMetadata()` function
    - Generate title: "Government Schemes 2024 - Central & State Yojana | SarkariPulse"
    - Generate meta description with keyword optimization
    - Add Open Graph and Twitter Card tags
    - Add canonical URL
    - Handle pagination in meta tags (rel="next", rel="prev")
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 5.3 Add structured data to listing page
    - Generate CollectionPage JSON-LD schema
    - Generate BreadcrumbList JSON-LD schema
    - Inject structured data into page
    - _Requirements: 6.3, 6.4_

  - [x] 5.4 Add category description and statistics section
    - Add introductory text about government schemes
    - Display statistics cards (total schemes, update frequency, service type)
    - Style with existing card components
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [x] 5.5 Implement pagination component integration
    - Reuse existing `Pagination` component
    - Pass pagination data from API response
    - Set basePath to "/schemes"
    - _Requirements: 5.1, 5.2_

- [x] 6. Build scheme detail page
  - [x] 6.1 Create scheme detail page component
    - Create `frontend/src/app/schemes/[slug]/page.tsx`
    - Implement server-side data fetching with `getSchemeBySlug()`
    - Handle 404 case with `notFound()`
    - Implement responsive layout (main content + sidebar TOC on desktop)
    - _Requirements: 1.3, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 7.2_

  - [x] 6.2 Add scheme detail header section
    - Display scheme type badge (Central/State with emoji and color)
    - Display scheme title (h1)
    - Display metadata row (department, state, view count)
    - Add quick info cards (launch date, scheme type, state, department)
    - _Requirements: 1.3, 2.3, 2.5, 3.1, 3.5, 9.1, 9.2_

  - [x] 6.3 Add scheme detail content sections
    - Summary section (highlighted with amber background)
    - Full description section
    - Eligibility criteria section
    - Benefits list section
    - Application process section
    - Handle missing optional sections gracefully
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.1, 10.3, 10.4, 10.5_

  - [x] 6.4 Add application link and contact information
    - Display prominent "Apply Online" button if applyLink exists
    - Open link in new tab with rel="noopener noreferrer"
    - Display disclaimer about external official website
    - Display helpline number if available
    - Display alternative instructions if no applyLink
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.1_

  - [x] 6.5 Add SEO metadata for detail page
    - Implement `generateMetadata()` function
    - Use metaTitle or generate from scheme title
    - Use metaDescription or generate from summary
    - Add Open Graph tags with dynamic OG image
    - Add Twitter Card tags
    - Add canonical URL
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 6.6 Add structured data to detail page
    - Generate GovernmentService JSON-LD schema
    - Generate BreadcrumbList JSON-LD schema
    - Generate FAQPage JSON-LD schema (if FAQ items exist)
    - Inject structured data into page
    - _Requirements: 6.3, 6.4_

  - [x] 6.7 Add FAQ section to detail page
    - Generate FAQ items from scheme data (eligibility, last date, application process, qualification, salary, vacancies)
    - Reuse existing `FAQ` component
    - Display only if FAQ items exist
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 6.8 Add related schemes section
    - Fetch related schemes with `getRelatedSchemes()`
    - Display in grid layout (1/2/3 columns)
    - Reuse SchemeCard component (to be created)
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [x] 6.9 Add share buttons and tags
    - Reuse existing `ShareButtons` component
    - Display scheme tags as clickable links to search
    - _Requirements: 8.1, 8.2_

  - [x] 6.10 Add Table of Contents component
    - Reuse existing `TableOfContents` component
    - Generate TOC items from page sections
    - Show sticky sidebar on desktop, collapsible on mobile
    - _Requirements: 7.2, 8.3_

  - [x] 6.11 Add last updated timestamp display
    - Display lastVerified or updatedAt date
    - Format as "Last updated: DD Month YYYY"
    - Style with muted text color
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 7. Create state-specific schemes page
  - [ ] 7.1 Create state-specific listing page
    - Create `frontend/src/app/schemes/state/[state]/page.tsx`
    - Fetch schemes with `getSchemesByState()`
    - Display state name in page title
    - Include central schemes applicable to all states
    - Reuse listing page layout and components
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 5.3, 5.4, 5.5_

  - [ ] 7.2 Add state-specific SEO metadata
    - Generate title: "{State} Government Schemes 2024 - State Yojana | SarkariPulse"
    - Generate meta description with state name
    - Add breadcrumb: Home > Schemes > {State}
    - _Requirements: 6.1, 6.2, 6.5, 8.2_

- [-] 8. Build reusable scheme components
  - [x] 8.1 Create SchemeCard component
    - Create `frontend/src/components/SchemeCard.tsx`
    - Display thumbnail or placeholder (🇮🇳 for central, 🏛️ for state)
    - Display scheme type badge with color coding
    - Display title (truncated if long)
    - Display summary (2-3 lines)
    - Display state name for state schemes
    - Display department name
    - Display view count
    - Add "View Details" link to scheme detail page
    - Handle missing optional fields (thumbnailUrl)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.5, 7.1, 10.2_

  - [ ] 8.2 Create SchemeFilters component
    - Create `frontend/src/components/SchemeFilters.tsx`
    - Add scheme type toggle (All/Central/State)
    - Add state dropdown with all Indian states
    - Add search input field
    - Emit filter changes to parent component
    - Style with touch-friendly controls (44x44px minimum)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.3_

  - [ ]* 8.3 Write component snapshot tests
    - Test SchemeCard with full data
    - Test SchemeCard with minimal data
    - Test SchemeFilters in default state
    - Test SchemeFilters with active filters
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Implement client-side filtering and search
  - [ ] 9.1 Add filter state management to listing page
    - Add state for current filters (schemeType, state, search)
    - Update URL query params when filters change
    - Fetch filtered data from API
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 9.2 Implement search functionality
    - Add search input to listing page
    - Debounce search input (300ms)
    - Call `searchSchemes()` API function
    - Display search results
    - Show "No results" message when empty
    - _Requirements: 5.1, 5.2, 5.6_

  - [ ] 9.3 Add empty state handling
    - Display empty state when no schemes match filters
    - Show message: "Koi schemes nahi mile"
    - Suggest trying different filters
    - _Requirements: 5.6_

- [ ] 10. Checkpoint - Frontend pages validation
  - Ensure all frontend pages render correctly, test navigation flows, verify SEO metadata, ask the user if questions arise.

- [x] 11. Integrate schemes into site navigation
  - [x] 11.1 Add "Government Schemes" to main navigation menu
    - Update `frontend/src/components/Header.tsx`
    - Add desktop menu item: "Government Schemes" between "Admit Cards" and "Admissions"
    - Add mobile menu item with 🏛️ emoji
    - Link to `/schemes`
    - _Requirements: 8.1_

  - [x] 11.2 Update footer with schemes link
    - Update `frontend/src/components/Footer.tsx`
    - Add "Government Schemes" to Quick Links section
    - Link to `/schemes`
    - _Requirements: 8.1, 8.4_

  - [x] 11.3 Add breadcrumb navigation to scheme pages
    - Reuse existing `Breadcrumb` component
    - Listing page: Home > Government Schemes
    - Detail page: Home > Government Schemes > {Scheme Name}
    - State page: Home > Government Schemes > {State}
    - _Requirements: 8.2, 8.3_

- [-] 12. Add schemes section to homepage
  - [x] 12.1 Create homepage schemes section
    - Update `frontend/src/app/page.tsx`
    - Fetch latest schemes with `getLatestSchemes(6)`
    - Add section header: "Government Schemes" with 🏛️ emoji
    - Display schemes in grid (1/2/3 columns)
    - Add "View All Schemes →" button linking to `/schemes`
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 8.1_

  - [ ] 12.2 Add internal linking between jobs and schemes
    - Update job detail page to show related schemes
    - Link agriculture jobs to farmer schemes
    - Link railway jobs to railway employee schemes
    - Add "Explore More" section with scheme links
    - _Requirements: 8.1, 8.2_

  - [ ] 12.3 Add internal linking from schemes to jobs
    - Update scheme detail page to show related jobs
    - Link schemes to relevant job categories
    - Example: PM Kisan → Agriculture jobs
    - Add contextual links in "Explore More" section
    - _Requirements: 8.1, 8.2_

- [ ] 13. Update global search to include schemes
  - [ ] 13.1 Extend global search functionality
    - Update `frontend/src/app/search/page.tsx`
    - Call both `searchJobs()` and `searchSchemes()` in parallel
    - Display schemes section in search results
    - Show scheme count: "Government Schemes (X)"
    - _Requirements: 5.1, 5.2, 8.1_

  - [ ] 13.2 Add scheme results to search page
    - Display scheme cards in search results
    - Separate section from jobs/results
    - Handle empty scheme results
    - _Requirements: 5.1, 5.2, 5.6_

- [ ] 14. Implement SEO enhancements
  - [ ] 14.1 Update sitemap generation
    - Update `frontend/src/app/sitemap.ts`
    - Add `/schemes` with priority 0.9, changefreq daily
    - Add all scheme detail pages with priority 0.8, changefreq weekly
    - Add state-specific pages with priority 0.7
    - Include lastmod from scheme updatedAt
    - _Requirements: 6.4_

  - [ ] 14.2 Create SEO utility functions for schemes
    - Update `frontend/src/lib/seo.ts`
    - Implement `generateSchemeMetaDescription()` (150-160 chars)
    - Implement `schemeJsonLd()` for GovernmentService schema
    - Implement `generateSchemeCollectionSchema()` for listing page
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ] 14.3 Add robots.txt entries for schemes
    - Update `frontend/src/app/robots.ts`
    - Allow all scheme pages
    - Add sitemap reference
    - _Requirements: 6.4_

- [ ] 15. Optimize images and performance
  - [ ] 15.1 Add scheme thumbnail images
    - Create placeholder images for schemes without thumbnails
    - Optimize images (WebP format, multiple sizes)
    - Store in `frontend/public/schemes/` directory
    - Update seed data with image paths
    - _Requirements: 7.4, 10.2_

  - [ ] 15.2 Implement lazy loading for images
    - Add `loading="lazy"` to scheme card images
    - Use Next.js Image component for optimization
    - Generate responsive image sizes
    - _Requirements: 7.4_

  - [ ] 15.3 Add API response caching
    - Set revalidate: 60 for scheme pages (1 minute cache)
    - Cache listing page responses
    - Cache detail page responses
    - _Requirements: Performance optimization_

- [ ] 16. Handle edge cases and error states
  - [ ] 16.1 Add 404 handling for invalid scheme slugs
    - Use Next.js `notFound()` function
    - Display custom 404 page
    - Suggest returning to schemes listing
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 16.2 Add error boundaries for scheme pages
    - Wrap scheme pages in error boundaries
    - Display user-friendly error messages
    - Log errors for debugging
    - _Requirements: Error handling_

  - [ ] 16.3 Add loading states
    - Create `frontend/src/app/schemes/loading.tsx`
    - Display skeleton loaders for scheme cards
    - Show loading spinner for detail page
    - _Requirements: User experience_

- [ ] 17. Write integration and E2E tests
  - [ ]* 17.1 Write backend integration tests
    - Test GET /api/schemes with pagination
    - Test GET /api/schemes?schemeType=central filtering
    - Test GET /api/schemes/state/:state filtering
    - Test GET /api/schemes/:slug with viewCount increment
    - Test GET /api/schemes/search with text search
    - Test GET /api/schemes/:slug/related
    - _Requirements: All backend requirements_

  - [ ]* 17.2 Write E2E tests for user workflows
    - Test: Browse schemes listing page
    - Test: Filter schemes by type and state
    - Test: Search schemes
    - Test: View scheme detail page
    - Test: Click apply button (opens in new tab)
    - Test: Navigate via breadcrumbs
    - Test: Mobile responsiveness
    - _Requirements: All user-facing requirements_

  - [ ]* 17.3 Validate SEO implementation
    - Test meta tags presence on all pages
    - Validate JSON-LD structured data with Google Rich Results Test
    - Test sitemap includes all scheme URLs
    - Test canonical URLs are correct
    - Test Open Graph tags render correctly
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 18. Final checkpoint and deployment preparation
  - Ensure all tests pass (unit, integration, E2E), verify all 15 MVP schemes display correctly, test on staging environment, validate SEO with Google Search Console, check mobile responsiveness, verify performance metrics (Lighthouse score > 90), ask the user if questions arise before production deployment.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Implementation follows existing SarkariPulse patterns (jobs, results, admissions)
- All code should be written in JavaScript/TypeScript following project conventions
- Reuse existing components wherever possible (Breadcrumb, FAQ, ShareButtons, Pagination, etc.)
- Focus on SEO optimization throughout implementation
- Ensure mobile-first responsive design
- Handle missing data gracefully with appropriate fallbacks
