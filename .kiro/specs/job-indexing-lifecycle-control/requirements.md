# Requirements Document

## Introduction

The SarkariJobNotification website is experiencing SEO indexing issues where Google Search Console reports 2.99K pages as "Not indexed". The root cause is a mismatch between job lifecycle management and search engine crawling behavior. Jobs are automatically deleted from MongoDB after a TTL period, but Google has already indexed these URLs. When crawlers revisit these URLs, they encounter 404 errors or deleted content, leading to indexing problems.

This feature implements proper SEO indexing controls for the job lifecycle, ensuring search engines understand the status of job postings (active, expired, deleted) through appropriate HTTP status codes and robots meta tags.

## Glossary

- **Job_Detail_Page**: The frontend Next.js page that displays individual job postings at `/job/[slug]`
- **Backend_API**: The Node.js/Express API that serves job data
- **Job_Controller**: The backend controller (`job.controller.js`) that handles job-related HTTP requests
- **Meta_Generator**: The backend utility (`metaGenerator.js`) that generates SEO meta tags for pages
- **MongoDB**: The database system where job documents are stored with TTL-based auto-deletion
- **Robots_Meta_Tag**: HTML meta tag that instructs search engines whether to index or follow links on a page
- **Active_Job**: A job with `status: 'active'` that should be indexed by search engines
- **Expired_Job**: A job with `status: 'expired'` that should not be indexed but still exists in the database
- **Deleted_Job**: A job that has been removed from MongoDB via TTL and no longer exists
- **HTTP_404**: Standard HTTP status code indicating a resource was not found
- **HTTP_410**: HTTP status code indicating a resource is permanently gone
- **Sitemap**: XML file listing URLs that search engines should crawl
- **TTL_Index**: MongoDB time-to-live index that automatically deletes documents after a specified duration
- **Search_Console**: Google's tool for monitoring website indexing and search performance

## Requirements

### Requirement 1: Robots Meta Tags for Active Jobs

**User Story:** As a website owner, I want active job postings to be indexed by search engines, so that users can discover them through search results.

#### Acceptance Criteria

1. WHEN a job has `status: 'active'`, THE Meta_Generator SHALL return robots meta tag with `index: true, follow: true`
2. THE Job_Detail_Page SHALL include the robots meta tag in the HTML `<head>` section
3. THE Meta_Generator SHALL generate OpenGraph and Twitter Card tags for active jobs
4. FOR ALL active jobs, parsing the generated metadata SHALL produce valid robots directives that allow indexing

### Requirement 2: Robots Meta Tags for Expired Jobs

**User Story:** As a website owner, I want expired job postings to be excluded from search results, so that users only find currently relevant opportunities.

#### Acceptance Criteria

1. WHEN a job has `status: 'expired'`, THE Meta_Generator SHALL return robots meta tag with `index: false, follow: true`
2. THE Job_Detail_Page SHALL include the noindex robots directive in the HTML `<head>` section
3. THE Meta_Generator SHALL continue generating OpenGraph and Twitter Card tags for expired jobs
4. FOR ALL expired jobs, parsing the generated metadata SHALL produce valid robots directives that prevent indexing while allowing link following

### Requirement 3: HTTP 404 Status for Deleted Jobs

**User Story:** As a website owner, I want deleted job URLs to return proper 404 status codes, so that search engines understand the content no longer exists.

#### Acceptance Criteria

1. WHEN a job slug is not found in MongoDB, THE Job_Controller SHALL return HTTP status 404
2. THE Job_Detail_Page SHALL render the Next.js 404 page when the API returns 404
3. THE Next.js 404 page SHALL include robots meta tag with `index: false, follow: false`
4. WHEN search engines crawl a deleted job URL, THE response SHALL contain HTTP 404 status AND noindex robots directive

### Requirement 4: HTTP 410 Gone for Permanently Deleted Jobs

**User Story:** As a website owner, I want search engines to quickly remove permanently deleted jobs from their index, so that "Not indexed" errors decrease faster.

#### Acceptance Criteria

1. WHEN a job slug matches a known deletion pattern OR has been marked as deleted, THE Job_Controller SHALL return HTTP status 410
2. THE Backend_API SHALL maintain a lightweight mechanism to distinguish between never-existed (404) and deleted (410) jobs
3. THE Job_Detail_Page SHALL handle 410 responses equivalently to 404 responses
4. FOR ALL requests to deleted job URLs, the HTTP response status SHALL be 410 AND include noindex robots directive

### Requirement 5: Sitemap Contains Only Active Jobs

**User Story:** As a website owner, I want the sitemap to only list active jobs, so that search engines prioritize crawling valid content.

#### Acceptance Criteria

1. WHEN generating the sitemap, THE Backend_API SHALL query jobs with filter `status: 'active'`
2. THE sitemap SHALL NOT contain URLs for jobs with `status: 'expired'`
3. THE sitemap SHALL NOT contain URLs for deleted jobs
4. FOR ALL URLs in the sitemap, querying MongoDB SHALL return a job document with `status: 'active'`

### Requirement 6: Job Detail Page Metadata Configuration

**User Story:** As a developer, I want the job detail page to properly integrate backend-generated SEO metadata, so that robots directives are correctly rendered.

#### Acceptance Criteria

1. THE Job_Detail_Page SHALL call the Backend_API to fetch job data including SEO metadata
2. WHEN the API returns job metadata, THE Job_Detail_Page SHALL extract and apply the robots directive
3. THE Job_Detail_Page `generateMetadata` function SHALL explicitly set the robots field based on job status
4. FOR ALL job detail page renders, the HTML output SHALL contain properly formatted robots meta tags matching the job status

### Requirement 7: Search Results Pages Remain Noindex

**User Story:** As a website owner, I want search results pages to remain excluded from search engines, so that we avoid thin content penalties.

#### Acceptance Criteria

1. THE Search_Page SHALL maintain robots meta tag with `index: false, follow: true`
2. WHEN query parameters change on the search page, THE robots directive SHALL remain `noindex, follow`
3. THE Search_Page metadata SHALL NOT be modified by job indexing lifecycle changes
4. FOR ALL search page URLs with any query string, parsing the metadata SHALL produce noindex directives

### Requirement 8: Robots.txt Sitemap Reference

**User Story:** As a website owner, I want robots.txt to correctly reference the sitemap, so that search engines can efficiently discover active job listings.

#### Acceptance Criteria

1. THE Backend_API SHALL serve robots.txt at the root path
2. THE robots.txt file SHALL contain a `Sitemap:` directive pointing to the sitemap XML URL
3. THE robots.txt file SHALL allow crawling of job detail pages
4. WHEN search engines request /robots.txt, THE response SHALL contain valid sitemap URL AND allow directives for job pages
