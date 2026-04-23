# Requirements Document

## Introduction

SarkariPulse is a production job automation website (sarkaripulse.net) built with Next.js 16, TypeScript, Tailwind CSS, MongoDB, and OpenAI. The site currently has 21 pages indexed by Google with 34 clicks, 8.46K impressions, 0.4% CTR, and average position 4.1 over the last 3 months. This feature aims to improve SEO performance, increase indexed pages, reduce bounce rate, and add missing legal pages (Cookie Policy) to meet Google Search Console requirements and improve user engagement.

## Glossary

- **SarkariPulse_System**: The Next.js frontend application serving sarkaripulse.net
- **Cookie_Policy_Page**: A new legal page explaining cookie usage and third-party services
- **SEO_Module**: The collection of SEO utilities, metadata generators, and structured data functions in `/frontend/src/lib/seo.ts`
- **Job_Detail_Page**: Dynamic page at `/job/[slug]` displaying individual job notifications
- **Legal_Pages**: Static pages including About, Contact, Privacy Policy, Disclaimer, and Cookie Policy
- **Internal_Link**: Hyperlink pointing to another page within sarkaripulse.net domain
- **Meta_Description**: HTML meta tag providing page summary for search engines (150-160 characters optimal)
- **Structured_Data**: JSON-LD schema markup for rich snippets in search results
- **CTR**: Click-Through Rate - percentage of impressions that result in clicks
- **Bounce_Rate**: Percentage of visitors who leave after viewing only one page
- **Indexed_Page**: Web page that Google has crawled and added to its search index
- **FAQ_Schema**: Structured data format for Frequently Asked Questions that enables rich snippets
- **Breadcrumb_Schema**: Structured data showing page hierarchy in search results
- **Canonical_URL**: The preferred URL for a page to avoid duplicate content issues
- **Hinglish**: Mixed language content using Hindi and English words
- **ISR**: Incremental Static Regeneration - Next.js feature for updating static pages

## Requirements

### Requirement 1: Cookie Policy Page Creation

**User Story:** As a website visitor, I want to read the Cookie Policy, so that I understand how SarkariPulse uses cookies and third-party services.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL create a Cookie Policy page at `/cookie-policy` route
2. THE Cookie_Policy_Page SHALL explain cookie usage by Google Analytics, Google AdSense, OneSignal, and Vercel Analytics
3. THE Cookie_Policy_Page SHALL provide instructions for disabling cookies in major browsers (Chrome, Firefox, Safari, Edge)
4. THE Cookie_Policy_Page SHALL include links to third-party privacy policies (Google, OneSignal, Vercel)
5. THE Cookie_Policy_Page SHALL use Hinglish language consistent with existing Legal_Pages
6. THE Cookie_Policy_Page SHALL include proper metadata with title "Cookie Policy — SarkariPulse" and description
7. THE Cookie_Policy_Page SHALL include canonical URL `/cookie-policy`
8. THE Cookie_Policy_Page SHALL include navigation links to Home and other Legal_Pages
9. THE Cookie_Policy_Page SHALL follow the same visual design pattern as existing Legal_Pages (card layout, typography, spacing)
10. THE Cookie_Policy_Page SHALL include a "Last Updated" date field

### Requirement 2: Footer Legal Links Enhancement

**User Story:** As a website visitor, I want to easily find legal pages in the footer, so that I can access Cookie Policy, Privacy Policy, and other legal information.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL add Cookie Policy link to the Footer component
2. THE Footer SHALL display legal links in a dedicated "Legal" or "Policies" section
3. THE Footer SHALL include links to Privacy Policy, Disclaimer, Cookie Policy, Contact, and About pages
4. THE Footer SHALL use consistent styling for all legal links
5. THE Footer SHALL remain mobile-responsive with proper spacing on small screens

### Requirement 3: Meta Description Optimization

**User Story:** As a search engine user, I want to see compelling meta descriptions in search results, so that I can decide whether to click on SarkariPulse pages.

#### Acceptance Criteria

1. WHEN generating metadata for Job_Detail_Page, THE SEO_Module SHALL create meta descriptions between 150-160 characters
2. THE Meta_Description SHALL include primary keywords (job title, organization, state)
3. THE Meta_Description SHALL include a call-to-action phrase in Hinglish (e.g., "Jaldi apply karein", "Last date check karein")
4. WHEN job has lastDate field, THE Meta_Description SHALL include the last date
5. WHEN job has vacancyCount field, THE Meta_Description SHALL include vacancy count
6. THE Meta_Description SHALL avoid truncation by staying within 160 character limit
7. FOR ALL category pages (jobs, admission, scholarship, result, admit-card, exam-form), THE SEO_Module SHALL generate unique meta descriptions with category-specific keywords
8. THE Meta_Description SHALL include location keywords for state-specific pages

### Requirement 4: Enhanced Structured Data

**User Story:** As a search engine crawler, I want comprehensive structured data, so that I can display rich snippets in search results.

#### Acceptance Criteria

1. THE SEO_Module SHALL generate FAQ_Schema for Job_Detail_Page with minimum 4 questions
2. THE FAQ_Schema SHALL include questions about eligibility, last date, application process, and qualification
3. WHEN job has salary field, THE FAQ_Schema SHALL include a salary-related question
4. THE SEO_Module SHALL generate Article schema for Job_Detail_Page with author, publisher, and datePublished fields
5. THE Article schema SHALL include headline, description, and image fields
6. THE SEO_Module SHALL generate BreadcrumbList schema for all category pages
7. THE Breadcrumb_Schema SHALL include proper position indexing starting from 1
8. THE SEO_Module SHALL generate Organization schema with social media links (when available)
9. THE JobPosting schema SHALL include all available fields (salary, location, employmentType, validThrough)

### Requirement 5: Internal Linking Strategy

**User Story:** As a website crawler, I want clear internal linking structure, so that I can discover and index all pages efficiently.

#### Acceptance Criteria

1. THE Job_Detail_Page SHALL include contextual Internal_Links to related category pages
2. THE Job_Detail_Page SHALL include Internal_Links to state-specific job pages when state field exists
3. THE Job_Detail_Page SHALL include Internal_Links to qualification-specific pages when qualificationLevel exists
4. THE Homepage SHALL include Internal_Links to all category pages with descriptive anchor text
5. THE Homepage SHALL include Internal_Links to top 10 states with job counts
6. THE Legal_Pages SHALL include cross-links to other Legal_Pages in a "Related Pages" section
7. THE Footer SHALL include Internal_Links to all major category pages
8. WHEN displaying job tags, THE SarkariPulse_System SHALL link each tag to search results for that tag
9. THE SarkariPulse_System SHALL ensure all Internal_Links use descriptive anchor text (not "click here")

### Requirement 6: FAQ Section for Legal Pages

**User Story:** As a website visitor, I want to find quick answers to common questions on legal pages, so that I can understand policies without reading entire documents.

#### Acceptance Criteria

1. THE Privacy_Policy_Page SHALL include an FAQ section with minimum 5 questions
2. THE FAQ section SHALL include questions about data collection, cookie usage, unsubscribe process, data deletion, and third-party services
3. THE About_Page SHALL include an FAQ section with minimum 5 questions
4. THE About_Page FAQ SHALL include questions about update frequency, notification methods, free service confirmation, official affiliation, and contact methods
5. THE FAQ sections SHALL use accordion or expandable design pattern for better UX
6. THE FAQ sections SHALL include FAQ_Schema structured data for search engines
7. THE FAQ content SHALL use Hinglish language consistent with page content

### Requirement 7: Content Enhancement for User Engagement

**User Story:** As a job seeker, I want engaging and helpful content on pages, so that I stay longer on the site and explore more opportunities.

#### Acceptance Criteria

1. THE Homepage SHALL include a "How It Works" section explaining the 3-step process (Browse → Read → Apply)
2. THE Homepage SHALL include a "Success Stories" or "Why Choose SarkariPulse" section with trust signals
3. THE Job_Detail_Page SHALL include a "How to Apply" step-by-step guide section when applyLink exists
4. THE Job_Detail_Page SHALL include a "Tips for Application" section with 3-5 helpful tips
5. THE About_Page SHALL include a "Our Story" section explaining why SarkariPulse was created
6. THE About_Page SHALL include team information or founder message (if available)
7. THE Contact_Page SHALL include a "Frequently Asked Questions" section before contact form
8. THE SarkariPulse_System SHALL add estimated reading time to all Job_Detail_Pages
9. THE SarkariPulse_System SHALL add "Last Updated" timestamp to all Legal_Pages

### Requirement 8: Keyword Optimization

**User Story:** As a search engine, I want to find relevant keywords in page content, so that I can rank pages for appropriate search queries.

#### Acceptance Criteria

1. THE Homepage SHALL include primary keywords in H1 tag: "Sarkari Naukri", "Government Jobs", "Sarkari Result"
2. THE Homepage SHALL include secondary keywords in H2 tags: "Latest Notifications", "Exam Results", "Admit Card"
3. THE Job_Detail_Page SHALL include job category keyword in first 100 words of content
4. THE Job_Detail_Page SHALL include location keyword (state name) in first 100 words when state exists
5. THE Category pages SHALL include category-specific long-tail keywords in meta title and H1
6. THE About_Page SHALL include keywords: "AI-powered", "real-time updates", "government jobs portal"
7. THE SarkariPulse_System SHALL ensure keyword density remains natural (1-2% for primary keywords)
8. THE SarkariPulse_System SHALL avoid keyword stuffing by maintaining readable, natural language

### Requirement 9: Mobile SEO Optimization

**User Story:** As a mobile search engine user, I want fast-loading, mobile-friendly pages, so that I can quickly access job information on my phone.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL ensure all pages pass Google Mobile-Friendly Test
2. THE SarkariPulse_System SHALL use responsive images with appropriate srcset attributes
3. THE SarkariPulse_System SHALL implement lazy loading for images below the fold
4. THE SarkariPulse_System SHALL ensure tap targets are minimum 48x48 pixels on mobile
5. THE SarkariPulse_System SHALL avoid horizontal scrolling on mobile devices
6. THE SarkariPulse_System SHALL use legible font sizes (minimum 16px for body text on mobile)
7. THE SarkariPulse_System SHALL ensure mobile viewport meta tag is properly configured
8. THE Job_Detail_Page SHALL display Table of Contents as collapsible on mobile devices

### Requirement 10: Page Speed Optimization

**User Story:** As a website visitor, I want pages to load quickly, so that I can access job information without waiting.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL achieve Lighthouse Performance score above 90 for Homepage
2. THE SarkariPulse_System SHALL achieve First Contentful Paint (FCP) under 1.5 seconds
3. THE SarkariPulse_System SHALL achieve Largest Contentful Paint (LCP) under 2.5 seconds
4. THE SarkariPulse_System SHALL implement font preloading for Inter font family
5. THE SarkariPulse_System SHALL minimize JavaScript bundle size by code splitting
6. THE SarkariPulse_System SHALL use Next.js Image component for all images
7. THE SarkariPulse_System SHALL implement ISR with revalidate: 60 for all dynamic pages
8. THE SarkariPulse_System SHALL defer non-critical third-party scripts (OneSignal, Analytics)

### Requirement 11: Sitemap Enhancement

**User Story:** As a search engine crawler, I want a comprehensive sitemap, so that I can discover and index all important pages.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL include Cookie Policy page in sitemap.xml
2. THE SarkariPulse_System SHALL include all Legal_Pages in sitemap with priority 0.4-0.5
3. THE SarkariPulse_System SHALL include state-specific pages for all states with jobs
4. THE SarkariPulse_System SHALL include qualification-specific pages in sitemap
5. THE SarkariPulse_System SHALL set appropriate changeFrequency for each page type (hourly for homepage, daily for jobs, monthly for legal)
6. THE SarkariPulse_System SHALL set appropriate priority values (1.0 for homepage, 0.8-0.9 for category pages, 0.7-0.8 for job pages)
7. THE SarkariPulse_System SHALL include lastModified timestamp for all URLs
8. THE SarkariPulse_System SHALL limit sitemap to 50,000 URLs or split into multiple sitemaps if exceeded

### Requirement 12: Open Graph and Twitter Card Optimization

**User Story:** As a social media user, I want attractive preview cards when sharing SarkariPulse links, so that I can share job opportunities with proper context.

#### Acceptance Criteria

1. THE Job_Detail_Page SHALL include Open Graph image with job title and organization name
2. THE Job_Detail_Page SHALL include Open Graph type "article" with published_time
3. THE Job_Detail_Page SHALL include Twitter Card type "summary_large_image"
4. THE Homepage SHALL include Open Graph image with SarkariPulse logo and tagline
5. THE Category pages SHALL include category-specific Open Graph images
6. THE Open Graph title SHALL be different from page title (optimized for social sharing)
7. THE Open Graph description SHALL be concise (50-100 characters) and action-oriented
8. THE SarkariPulse_System SHALL include og:locale as "hi_IN" for all pages

### Requirement 13: Canonical URL Management

**User Story:** As a search engine, I want clear canonical URLs, so that I can avoid indexing duplicate content.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL include canonical URL for all pages
2. THE Job_Detail_Page SHALL use canonical URL format: `https://sarkaripulse.net/job/{slug}`
3. THE Category pages SHALL use canonical URL without query parameters
4. THE State-specific pages SHALL use canonical URL with encoded state name
5. THE Search results page SHALL include noindex meta tag to avoid indexing search results
6. WHEN pagination exists, THE SarkariPulse_System SHALL use rel="next" and rel="prev" link tags
7. THE SarkariPulse_System SHALL ensure canonical URLs use HTTPS protocol
8. THE SarkariPulse_System SHALL ensure canonical URLs do not include trailing slashes (consistent format)

### Requirement 14: Accessibility and SEO Compliance

**User Story:** As a screen reader user, I want accessible content with proper semantic HTML, so that I can navigate the site effectively.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL use semantic HTML5 elements (header, nav, main, article, section, footer)
2. THE SarkariPulse_System SHALL include descriptive alt text for all images
3. THE SarkariPulse_System SHALL use proper heading hierarchy (H1 → H2 → H3) without skipping levels
4. THE SarkariPulse_System SHALL include ARIA labels for icon-only buttons
5. THE SarkariPulse_System SHALL ensure all forms have associated labels
6. THE SarkariPulse_System SHALL provide skip-to-content link for keyboard navigation
7. THE SarkariPulse_System SHALL ensure color contrast ratio meets WCAG AA standards (4.5:1 for normal text)
8. THE SarkariPulse_System SHALL include lang="hi" attribute in HTML tag

### Requirement 15: Analytics and Monitoring Integration

**User Story:** As a website administrator, I want to track SEO improvements, so that I can measure the impact of changes.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL track page views for all pages using Google Analytics
2. THE SarkariPulse_System SHALL track scroll depth for Job_Detail_Pages
3. THE SarkariPulse_System SHALL track click events on "Apply Now" buttons
4. THE SarkariPulse_System SHALL track internal link clicks to measure navigation patterns
5. THE SarkariPulse_System SHALL track search queries from internal search form
6. THE SarkariPulse_System SHALL implement custom events for social share button clicks
7. THE SarkariPulse_System SHALL track time-on-page for all Job_Detail_Pages
8. THE SarkariPulse_System SHALL send Core Web Vitals data to Google Analytics

### Requirement 16: Content Freshness Signals

**User Story:** As a search engine, I want to see freshness signals on pages, so that I can prioritize recently updated content.

#### Acceptance Criteria

1. THE Job_Detail_Page SHALL display "Posted on" date prominently near the title
2. THE Job_Detail_Page SHALL display "Last Updated" date when content is modified
3. THE Homepage SHALL display "Last Updated" timestamp in footer
4. THE Legal_Pages SHALL display "Last Updated" date at the top of the page
5. THE SarkariPulse_System SHALL include dateModified field in Article schema when content is updated
6. THE SarkariPulse_System SHALL use relative time format ("2h ago", "3d ago") for recent jobs (< 7 days)
7. THE SarkariPulse_System SHALL highlight "New" badge for jobs posted within last 24 hours
8. THE Category pages SHALL sort jobs by createdAt date in descending order by default

### Requirement 17: Error Page SEO Optimization

**User Story:** As a website visitor who encounters an error, I want helpful error pages with navigation options, so that I can find what I'm looking for instead of leaving the site.

#### Acceptance Criteria

1. THE 404_Error_Page SHALL include search form to help users find content
2. THE 404_Error_Page SHALL include links to popular categories (Jobs, Results, Admit Card)
3. THE 404_Error_Page SHALL include links to recently posted jobs
4. THE 404_Error_Page SHALL use noindex meta tag to prevent indexing
5. THE 404_Error_Page SHALL return proper 404 HTTP status code
6. THE 404_Error_Page SHALL include Hinglish message explaining the error
7. THE 500_Error_Page SHALL include contact link and apology message
8. THE Error_Pages SHALL maintain consistent branding and design with rest of site

### Requirement 18: Local SEO for State Pages

**User Story:** As a job seeker searching for state-specific jobs, I want to find SarkariPulse state pages in local search results, so that I can see jobs relevant to my location.

#### Acceptance Criteria

1. THE State_Job_Page SHALL include state name in H1 tag: "Sarkari Naukri in {State}"
2. THE State_Job_Page SHALL include state name in meta title and description
3. THE State_Job_Page SHALL include LocalBusiness schema with addressRegion field
4. THE State_Job_Page SHALL include breadcrumb showing: Home → Jobs → {State}
5. THE State_Job_Page SHALL include content section explaining job opportunities in that state
6. THE State_Job_Page SHALL include links to neighboring states
7. THE State_Job_Page SHALL include statistics: total jobs, latest job date, popular categories
8. THE State_Job_Page SHALL use canonical URL with properly encoded state name

### Requirement 19: Rich Snippets for Category Pages

**User Story:** As a search engine user, I want to see rich snippets for category pages, so that I can quickly understand what content is available.

#### Acceptance Criteria

1. THE Category_Page SHALL include CollectionPage schema with numberOfItems field
2. THE Category_Page SHALL include ItemList schema listing top 10 jobs with position
3. THE Category_Page SHALL include BreadcrumbList schema
4. THE Category_Page SHALL include description section explaining the category
5. THE Category_Page SHALL include statistics: total items, update frequency, latest update
6. THE Category_Page SHALL include FAQ_Schema with category-specific questions
7. THE Category_Page SHALL include filters section (by state, qualification, organization)
8. THE Category_Page SHALL use descriptive H1 tag with category name and year

### Requirement 20: Search Engine Directives

**User Story:** As a search engine crawler, I want clear directives about which pages to index, so that I can respect the site's indexing preferences.

#### Acceptance Criteria

1. THE SarkariPulse_System SHALL include robots meta tag on all pages
2. THE Search_Results_Page SHALL use "noindex, follow" directive
3. THE Pagination_Pages SHALL use "index, follow" directive with canonical to page 1
4. THE Legal_Pages SHALL use "index, follow" directive
5. THE Job_Detail_Page SHALL use "index, follow" directive
6. THE robots.txt SHALL allow all crawlers to access all pages except /api/
7. THE robots.txt SHALL include sitemap URL
8. THE SarkariPulse_System SHALL include X-Robots-Tag header for API routes: "noindex, nofollow"

## Implementation Notes

### Priority Order for Implementation

1. **High Priority (Week 1)**:
   - Requirement 1: Cookie Policy Page Creation
   - Requirement 2: Footer Legal Links Enhancement
   - Requirement 3: Meta Description Optimization
   - Requirement 11: Sitemap Enhancement

2. **Medium Priority (Week 2)**:
   - Requirement 4: Enhanced Structured Data
   - Requirement 5: Internal Linking Strategy
   - Requirement 8: Keyword Optimization
   - Requirement 13: Canonical URL Management

3. **Low Priority (Week 3)**:
   - Requirement 6: FAQ Section for Legal Pages
   - Requirement 7: Content Enhancement for User Engagement
   - Requirement 18: Local SEO for State Pages
   - Requirement 19: Rich Snippets for Category Pages

4. **Ongoing Optimization**:
   - Requirement 9: Mobile SEO Optimization
   - Requirement 10: Page Speed Optimization
   - Requirement 14: Accessibility and SEO Compliance
   - Requirement 15: Analytics and Monitoring Integration

### Technical Considerations

- All changes must maintain existing ISR (revalidate: 60) configuration
- Maintain Hinglish language tone across all new content
- Ensure backward compatibility with existing URLs
- Test all changes in development before production deployment
- Monitor Google Search Console for indexing status after deployment
- Use Next.js 16 App Router conventions for all new pages
- Follow existing TypeScript and Tailwind CSS patterns
- Ensure all structured data validates using Google Rich Results Test

### Success Metrics

- **Indexed Pages**: Increase from 21 to 35+ pages within 30 days
- **CTR**: Improve from 0.4% to 2%+ within 60 days
- **Average Position**: Improve from 4.1 to top 3 within 90 days
- **Bounce Rate**: Reduce by 20% within 60 days
- **Page Load Time**: Maintain LCP under 2.5 seconds
- **Mobile Usability**: Zero mobile usability issues in Search Console
- **Rich Snippets**: Achieve rich snippets for 50%+ of job pages within 60 days
