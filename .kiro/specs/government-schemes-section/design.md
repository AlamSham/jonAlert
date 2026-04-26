# Design Document: Government Schemes Section

## Overview

The Government Schemes section extends SarkariPulse.net with a dedicated feature for displaying central and state-specific government welfare schemes. This feature follows the established patterns used for jobs, results, and admissions while introducing scheme-specific data models and components.

### Goals

- Provide users with comprehensive information about government schemes
- Increase organic traffic through scheme-related searches
- Maintain consistency with existing SarkariPulse design patterns
- Enable efficient search and filtering of schemes by type and state
- Optimize for SEO with structured data and meta tags

### Non-Goals

- Real-time scheme application processing
- User authentication or application tracking
- Scheme comparison tools (future enhancement)
- Multi-language support beyond Hinglish (future enhancement)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                      │
│  - /schemes (listing)                                        │
│  - /schemes/[slug] (detail)                                  │
│  - /schemes/state/[state] (state-specific listing)           │
│                                                              │
│  Components:                                                 │
│  - SchemeCard, SchemeFilters, SchemeDetail                   │
│  - Reused: Breadcrumb, FAQ, ShareButtons, SEO components     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────┤
│  Routes: /api/schemes/*                                      │
│  Controllers: scheme.controller.js                           │
│  Services: scheme.service.js                                 │
│  Models: Scheme.js (MongoDB)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│                    schemes collection                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **SEO**: JSON-LD structured data (GovernmentService schema)
- **Deployment**: Existing infrastructure (no changes required)

## Components and Interfaces

### Backend Components

#### 1. Scheme Model (`backend/src/models/Scheme.js`)

MongoDB schema for storing scheme information:

```javascript
{
  title: String,              // Scheme name
  slug: String,               // URL-friendly identifier (unique, indexed)
  description: String,        // Full scheme description
  summary: String,            // Brief overview (150-200 chars)
  schemeType: String,         // 'central' | 'state'
  state: String,              // State name (for state schemes) or 'All India'
  launchDate: Date,           // Scheme launch date
  department: String,         // Responsible department/ministry
  
  // Eligibility and Benefits
  eligibility: String,        // Eligibility criteria (markdown/text)
  benefits: String,           // List of benefits (markdown/text)
  applicationProcess: String, // Step-by-step process (markdown/text)
  
  // Links and Resources
  applyLink: String,          // Official application URL
  officialWebsite: String,    // Scheme website
  helplineNumber: String,     // Contact number
  
  // SEO and Metadata
  metaTitle: String,
  metaDescription: String,
  tags: [String],             // Keywords for search
  thumbnailUrl: String,       // Scheme image/logo
  
  // Analytics
  viewCount: Number,          // Page view counter
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastVerified: Date          // Last content verification date
}
```

**Indexes:**
- `slug`: unique, for fast lookups
- `schemeType`: for filtering central vs state
- `state`: for state-specific queries
- `tags`: for search functionality
- Text index on `title`, `description`, `summary` for full-text search

#### 2. Scheme Controller (`backend/src/controllers/scheme.controller.js`)

Handles HTTP requests for scheme operations:

**Endpoints:**
- `GET /api/schemes` - List all schemes with pagination
- `GET /api/schemes/latest` - Get recently added schemes
- `GET /api/schemes/:slug` - Get single scheme by slug
- `GET /api/schemes/type/:type` - Filter by central/state
- `GET /api/schemes/state/:state` - Get state-specific schemes
- `GET /api/schemes/search` - Search schemes by query
- `GET /api/schemes/:slug/related` - Get related schemes

**Response Format:**
```javascript
{
  data: Scheme | Scheme[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

#### 3. Scheme Service (`backend/src/services/scheme.service.js`)

Business logic layer for scheme operations:

- Data validation and sanitization
- Slug generation from scheme titles
- Related schemes algorithm (by state, type, tags)
- Search query processing

#### 4. API Routes (`backend/src/routes/scheme.routes.js`)

Route definitions with validation middleware:

```javascript
schemeRouter.get('/schemes', validateRequest, catchAsync(getSchemes));
schemeRouter.get('/schemes/latest', validateRequest, catchAsync(getLatestSchemes));
schemeRouter.get('/schemes/:slug', validateRequest, catchAsync(getSchemeBySlug));
// ... additional routes
```

### Frontend Components

#### 1. Scheme Listing Page (`frontend/src/app/schemes/page.tsx`)

**Features:**
- Grid layout of scheme cards (responsive: 1/2/3 columns)
- Search bar for filtering schemes
- Filter controls (Central/State, State selector)
- Pagination
- SEO metadata and structured data
- Statistics section (total schemes, categories)

**Data Fetching:**
```typescript
const { data: schemes, pagination } = await getSchemes(page, limit, filters);
```

#### 2. Scheme Detail Page (`frontend/src/app/schemes/[slug]/page.tsx`)

**Sections:**
- Header with scheme name, type badge, department
- Quick info cards (launch date, scheme type, state)
- Summary section (highlighted)
- Full description
- Eligibility criteria
- Benefits list
- Application process steps
- Apply button (prominent CTA)
- FAQ section
- Share buttons
- Related schemes

**Layout:**
- Main content area (max-width: 4xl)
- Sticky sidebar with Table of Contents (desktop)
- Mobile-optimized layout

#### 3. State-Specific Schemes Page (`frontend/src/app/schemes/state/[state]/page.tsx`)

Similar to main listing but filtered by state:
- Breadcrumb: Home > Schemes > {State}
- State-specific SEO metadata
- Filter to show central schemes applicable to that state

#### 4. SchemeCard Component (`frontend/src/components/SchemeCard.tsx`)

Reusable card for displaying scheme preview:

```typescript
interface SchemeCardProps {
  scheme: SchemeListItem;
  index: number;
}

// Visual elements:
// - Thumbnail image or placeholder
// - Scheme type badge (Central/State)
// - Title (truncated if long)
// - Summary (2-3 lines)
// - State name (for state schemes)
// - Department name
// - View count
// - "View Details" link
```

#### 5. SchemeFilters Component (`frontend/src/components/SchemeFilters.tsx`)

Filter controls for scheme listing:

```typescript
interface SchemeFiltersProps {
  onFilterChange: (filters: SchemeFilters) => void;
  currentFilters: SchemeFilters;
}

// Filter options:
// - Scheme Type: All | Central | State
// - State: Dropdown with all Indian states
// - Search: Text input
```

#### 6. SchemeDetail Component (`frontend/src/components/SchemeDetail.tsx`)

Detailed scheme information display:
- Structured sections with icons
- Collapsible sections for long content
- Copy-to-clipboard for helpline numbers
- External link warnings for apply buttons

### API Client (`frontend/src/lib/api.ts`)

New functions for scheme data fetching:

```typescript
export async function getSchemes(
  page = 1, 
  limit = 18, 
  filters?: SchemeFilters
): Promise<PaginatedResponse<SchemeListItem>>;

export async function getSchemeBySlug(
  slug: string
): Promise<SchemeDetail | null>;

export async function getSchemesByState(
  state: string, 
  page = 1, 
  limit = 18
): Promise<PaginatedResponse<SchemeListItem>>;

export async function searchSchemes(
  query: string
): Promise<SchemeListItem[]>;

export async function getRelatedSchemes(
  slug: string
): Promise<SchemeListItem[]>;
```

### Type Definitions (`frontend/src/lib/types.ts`)

```typescript
export type SchemeType = 'central' | 'state';

export type SchemeListItem = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  schemeType: SchemeType;
  state: string;
  department: string;
  thumbnailUrl?: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
};

export type SchemeDetail = SchemeListItem & {
  description: string;
  launchDate?: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  applyLink?: string;
  officialWebsite?: string;
  helplineNumber?: string;
  metaTitle: string;
  metaDescription: string;
  lastVerified?: string;
};

export type SchemeFilters = {
  schemeType?: SchemeType;
  state?: string;
  search?: string;
};
```

## Data Models

### Scheme Document Structure

**Required Fields:**
- `title`: Scheme name (e.g., "PM Kisan Samman Nidhi Yojana")
- `slug`: URL identifier (e.g., "pm-kisan-samman-nidhi-yojana")
- `description`: Full scheme details
- `summary`: Brief overview for cards
- `schemeType`: "central" or "state"
- `state`: State name or "All India"
- `eligibility`: Who can apply
- `benefits`: What beneficiaries receive
- `applicationProcess`: How to apply

**Optional Fields:**
- `applyLink`: Direct application URL
- `officialWebsite`: Scheme portal
- `helplineNumber`: Contact information
- `thumbnailUrl`: Scheme logo/image
- `department`: Responsible ministry/department
- `launchDate`: When scheme was launched
- `metaTitle`, `metaDescription`: SEO overrides
- `tags`: Keywords for search
- `lastVerified`: Content accuracy timestamp

### Sample Scheme Data

```json
{
  "title": "PM Kisan Samman Nidhi Yojana",
  "slug": "pm-kisan-samman-nidhi-yojana",
  "description": "PM-KISAN is a Central Sector scheme with 100% funding from Government of India. Under the scheme, income support of Rs. 6000/- per year is provided to all farmer families across the country in three equal installments of Rs. 2000/- each every four months.",
  "summary": "₹6000 per year direct income support to farmer families in three installments",
  "schemeType": "central",
  "state": "All India",
  "department": "Ministry of Agriculture & Farmers Welfare",
  "launchDate": "2019-02-01",
  "eligibility": "All landholding farmer families. Exclusions: Institutional landholders, farmers who are/were in constitutional posts, serving/retired government employees, income tax payers, professionals.",
  "benefits": "- ₹6000 per year in three installments\n- Direct Benefit Transfer to bank account\n- No application fee\n- Online application and status tracking",
  "applicationProcess": "1. Visit pmkisan.gov.in\n2. Click on 'Farmers Corner'\n3. Select 'New Farmer Registration'\n4. Enter Aadhaar number and mobile\n5. Fill registration form\n6. Upload land documents\n7. Submit application",
  "applyLink": "https://pmkisan.gov.in/",
  "officialWebsite": "https://pmkisan.gov.in/",
  "helplineNumber": "155261 / 011-24300606",
  "thumbnailUrl": "/schemes/pm-kisan.jpg",
  "tags": ["farmer", "agriculture", "income support", "DBT", "central scheme"],
  "metaTitle": "PM Kisan Yojana 2024 - ₹6000 Direct Benefit | Apply Online",
  "metaDescription": "PM Kisan Samman Nidhi Yojana - ₹6000 yearly income support for farmers. Check eligibility, apply online, track status. Helpline: 155261",
  "viewCount": 0,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "lastVerified": "2024-01-15T10:00:00Z"
}
```

### MVP Scheme List

**Central Schemes (5):**
1. PM Kisan Samman Nidhi Yojana
2. Ayushman Bharat (PM-JAY)
3. PM Awas Yojana (Gramin & Urban)
4. Pradhan Mantri Mudra Yojana
5. Sukanya Samriddhi Yojana

**State Schemes - Jharkhand (5):**
1. Jharkhand Mukhyamantri Samman Yojana
2. Savitribai Phule Kishori Samriddhi Yojana
3. Jharkhand Mukhyamantri Krishi Ashirwad Yojana
4. Birsa Harit Gram Yojana
5. Jharkhand Guruji Credit Card Yojana

**Additional Popular Schemes (5):**
1. PM Fasal Bima Yojana
2. Atal Pension Yojana
3. PM Ujjwala Yojana
4. Beti Bachao Beti Padhao
5. Stand Up India Scheme

## SEO Implementation

### URL Structure

```
/schemes                           → Main listing page
/schemes/[slug]                    → Scheme detail page
/schemes/state/[state]             → State-specific schemes
/schemes/type/central              → Central schemes only
/schemes/type/state                → State schemes only
```

**SEO-Friendly Slugs:**
- Lowercase, hyphen-separated
- Include scheme name keywords
- Examples: `pm-kisan-yojana`, `ayushman-bharat`, `jharkhand-samman-yojana`

### Meta Tags

**Listing Page:**
```html
<title>Government Schemes 2024 - Central & State Yojana | SarkariPulse</title>
<meta name="description" content="Latest government schemes 2024 - PM Kisan, Ayushman Bharat, state yojanas. Check eligibility, benefits, apply online. Free information in Hinglish." />
```

**Detail Page:**
```html
<title>{metaTitle || `${title} - Eligibility, Benefits, Apply Online`}</title>
<meta name="description" content="{metaDescription || summary}" />
```

**State Page:**
```html
<title>{State} Government Schemes 2024 - State Yojana | SarkariPulse</title>
<meta name="description" content="Latest {state} government schemes - eligibility, benefits, application process. State aur central schemes ki complete jankari." />
```

### Structured Data (JSON-LD)

**GovernmentService Schema for Scheme Detail:**

```json
{
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "PM Kisan Samman Nidhi Yojana",
  "description": "₹6000 per year direct income support...",
  "provider": {
    "@type": "GovernmentOrganization",
    "name": "Ministry of Agriculture & Farmers Welfare",
    "url": "https://agricoop.gov.in/"
  },
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Farmers"
  },
  "serviceType": "Financial Assistance",
  "url": "https://sarkaripulse.net/schemes/pm-kisan-yojana",
  "termsOfService": "https://pmkisan.gov.in/",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://pmkisan.gov.in/",
    "servicePhone": "155261"
  }
}
```

**BreadcrumbList Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://sarkaripulse.net/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Government Schemes",
      "item": "https://sarkaripulse.net/schemes"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "PM Kisan Yojana"
    }
  ]
}
```

**FAQPage Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "PM Kisan Yojana ke liye eligibility kya hai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All landholding farmer families..."
      }
    }
  ]
}
```

### Sitemap Integration

Add schemes to existing sitemap generation:

```xml
<url>
  <loc>https://sarkaripulse.net/schemes</loc>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://sarkaripulse.net/schemes/pm-kisan-yojana</loc>
  <lastmod>2024-01-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

## Search and Filtering

### Client-Side Filtering

For small datasets (< 100 schemes), implement client-side filtering:

```typescript
const filteredSchemes = schemes.filter(scheme => {
  // Type filter
  if (filters.schemeType && scheme.schemeType !== filters.schemeType) {
    return false;
  }
  
  // State filter
  if (filters.state && scheme.state !== filters.state && scheme.state !== 'All India') {
    return false;
  }
  
  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    return (
      scheme.title.toLowerCase().includes(searchLower) ||
      scheme.summary.toLowerCase().includes(searchLower) ||
      scheme.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  return true;
});
```

### Server-Side Search

For larger datasets, use MongoDB text search:

```javascript
// Text index search
const schemes = await Scheme.find(
  { $text: { $search: query } },
  { score: { $meta: 'textScore' } }
)
  .sort({ score: { $meta: 'textScore' } })
  .limit(20);
```

### Filter UI Components

**Scheme Type Toggle:**
```
[ All ] [ Central ] [ State ]
```

**State Dropdown:**
```
Select State: [ All India ▼ ]
  - All India
  - Andhra Pradesh
  - Jharkhand
  - ...
```

**Search Input:**
```
🔍 Search schemes... [                    ]
```

## Integration Points

### Navigation Menu

Add "Government Schemes" to main navigation:

**Desktop Header:**
```
Home | Jobs | Results | Admit Cards | Schemes | Admissions | Scholarships
```

**Mobile Menu:**
```
🏠 Home
💼 Jobs
📊 Results
🎫 Admit Cards
🏛️ Government Schemes  ← NEW
🎓 Admissions
💰 Scholarships
```

### Homepage Integration

Add schemes section to homepage:

```tsx
<section className="py-12">
  <SectionHeader
    title="Government Schemes"
    subtitle="Central aur state yojanas ki jankari"
    icon="🏛️"
  />
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {latestSchemes.map(scheme => (
      <SchemeCard key={scheme.slug} scheme={scheme} />
    ))}
  </div>
  <Link href="/schemes" className="btn-primary mt-6">
    View All Schemes →
  </Link>
</section>
```

### Internal Linking

**From Job Detail Pages:**
- Link to relevant schemes in "Explore More" section
- Example: Railway job → Railway employee welfare schemes

**From Scheme Detail Pages:**
- Link to related job categories
- Example: PM Kisan → Agriculture department jobs

**Contextual Links:**
```typescript
// In job detail page
if (job.category === 'job' && job.tags.includes('agriculture')) {
  relatedSchemes = await getSchemesByTag('agriculture');
}

// In scheme detail page
if (scheme.department === 'Ministry of Railways') {
  relatedJobs = await getJobsByOrganization('Railway');
}
```

### Search Integration

Update global search to include schemes:

```typescript
export async function globalSearch(query: string) {
  const [jobs, schemes] = await Promise.all([
    searchJobs(query),
    searchSchemes(query)
  ]);
  
  return {
    jobs,
    schemes,
    total: jobs.length + schemes.length
  };
}
```

Display schemes in search results:

```tsx
{schemes.length > 0 && (
  <section>
    <h3>Government Schemes ({schemes.length})</h3>
    {schemes.map(scheme => (
      <SchemeCard key={scheme.slug} scheme={scheme} />
    ))}
  </section>
)}
```

### Footer Links

Add schemes to footer navigation:

```
Quick Links:
- All Jobs
- Latest Results
- Admit Cards
- Government Schemes  ← NEW
- Admissions
- Scholarships
```

## Error Handling

### Missing Data Handling

**No Apply Link:**
```tsx
{scheme.applyLink ? (
  <a href={scheme.applyLink} className="btn-primary">
    Apply Online
  </a>
) : (
  <div className="card bg-amber-50">
    <p>Application process: Visit your nearest {scheme.department} office or check official website for updates.</p>
  </div>
)}
```

**No Thumbnail:**
```tsx
<div className="scheme-thumbnail">
  {scheme.thumbnailUrl ? (
    <img src={scheme.thumbnailUrl} alt={scheme.title} />
  ) : (
    <div className="placeholder-thumbnail">
      {scheme.schemeType === 'central' ? '🇮🇳' : '🏛️'}
    </div>
  )}
</div>
```

**Missing Eligibility:**
```tsx
{scheme.eligibility ? (
  <div className="eligibility-section">
    {scheme.eligibility}
  </div>
) : (
  <div className="card bg-blue-50">
    <p>📝 Eligibility criteria are being updated. Please check official website or contact helpline for details.</p>
  </div>
)}
```

### API Error Handling

```typescript
export async function getSchemeBySlug(slug: string): Promise<SchemeDetail | null> {
  try {
    const response = await fetch(`${API_BASE}/api/schemes/${slug}`, {
      next: { revalidate: 60 },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch scheme:', error);
    return null;
  }
}
```

### 404 Handling

```tsx
export default async function SchemeDetailPage({ params }: Props) {
  const { slug } = await params;
  const scheme = await getSchemeBySlug(slug);
  
  if (!scheme) {
    notFound(); // Next.js 404 page
  }
  
  return <SchemeDetailView scheme={scheme} />;
}
```

### Empty States

**No Schemes Found:**
```tsx
{schemes.length === 0 && (
  <div className="py-20 text-center">
    <p className="text-4xl">🔍</p>
    <p className="mt-4 font-bold text-muted">
      Koi schemes nahi mile
    </p>
    <p className="text-sm text-muted mt-2">
      Try different filters or search terms
    </p>
  </div>
)}
```

## Testing Strategy

### Why Property-Based Testing Is Not Applicable

Property-based testing (PBT) is **not appropriate** for this feature because:

1. **Primarily CRUD Operations**: The feature involves simple database reads/writes with no complex transformation logic
2. **UI Rendering**: Scheme cards and detail pages are better tested with snapshot tests and visual regression tests
3. **Deterministic Operations**: SEO metadata generation, filtering, and search are deterministic operations best validated with example-based tests
4. **No Universal Properties**: There are no meaningful "for all inputs X, property P(X) holds" statements to test

Instead, we will use:
- **Unit tests** for individual functions and components
- **Integration tests** for API endpoints and database operations
- **Snapshot tests** for UI components
- **End-to-end tests** for user workflows

### Unit Tests

**Backend:**
- **Scheme Model Validation**
  - Valid scheme data creates document successfully
  - Required fields validation (title, slug, schemeType, etc.)
  - Enum validation for schemeType ('central' | 'state')
  - Unique slug constraint enforcement
  - Default values applied correctly (viewCount = 0, state = 'All India')

- **Controller Functions**
  - `getSchemes()` returns paginated results
  - `getSchemeBySlug()` returns correct scheme or 404
  - `getSchemesByState()` filters by state correctly
  - `searchSchemes()` returns matching results
  - View count increments on detail page access

- **Service Layer**
  - Slug generation from title (handles special characters, duplicates)
  - Related schemes algorithm (by state, type, tags)
  - Search query sanitization (prevents injection)
  - Filter combination logic

- **Utilities**
  - `slugify()` converts titles to URL-safe slugs
  - `escapeRegex()` sanitizes search queries
  - `cleanLimit()` validates pagination parameters

**Frontend:**
- **Component Rendering**
  - SchemeCard displays all required fields
  - SchemeCard handles missing optional fields (thumbnail, applyLink)
  - SchemeFilters updates state on user interaction
  - SchemeDetail sections render markdown content
  - Breadcrumb generates correct navigation path

- **Filter Logic**
  - Client-side filtering by schemeType works correctly
  - State filter includes "All India" schemes
  - Search filter matches title, summary, and tags
  - Multiple filters combine with AND logic

- **API Client Functions**
  - `getSchemes()` constructs correct query parameters
  - `getSchemeBySlug()` handles 404 responses
  - `searchSchemes()` encodes query strings properly
  - Error handling returns null/empty arrays gracefully

- **SEO Metadata Generation**
  - `generateSchemeMetaDescription()` creates 150-160 char descriptions
  - `schemeJsonLd()` generates valid GovernmentService schema
  - `breadcrumbJsonLd()` creates correct breadcrumb structure
  - Meta tags include all required fields

**Example Unit Tests:**

```typescript
// Frontend: SchemeCard component
describe('SchemeCard', () => {
  it('renders scheme with all fields', () => {
    const scheme = {
      title: 'PM Kisan Yojana',
      slug: 'pm-kisan-yojana',
      summary: 'Income support for farmers',
      schemeType: 'central',
      state: 'All India',
      department: 'Agriculture Ministry',
      thumbnailUrl: '/schemes/pm-kisan.jpg',
      viewCount: 150
    };
    
    const { getByText, getByAltText } = render(<SchemeCard scheme={scheme} />);
    
    expect(getByText('PM Kisan Yojana')).toBeInTheDocument();
    expect(getByText('Income support for farmers')).toBeInTheDocument();
    expect(getByText('Central')).toBeInTheDocument();
    expect(getByAltText('PM Kisan Yojana')).toHaveAttribute('src', '/schemes/pm-kisan.jpg');
  });
  
  it('handles missing thumbnail with placeholder', () => {
    const scheme = { ...mockScheme, thumbnailUrl: undefined };
    const { container } = render(<SchemeCard scheme={scheme} />);
    
    expect(container.querySelector('.placeholder-thumbnail')).toBeInTheDocument();
  });
});

// Backend: Slug generation
describe('slugify', () => {
  it('converts title to lowercase slug', () => {
    expect(slugify('PM Kisan Yojana')).toBe('pm-kisan-yojana');
  });
  
  it('handles special characters', () => {
    expect(slugify('Scheme (2024) - New!')).toBe('scheme-2024-new');
  });
  
  it('removes consecutive hyphens', () => {
    expect(slugify('Scheme  --  Name')).toBe('scheme-name');
  });
});
```

### Integration Tests

**API Endpoints:**
- `GET /api/schemes` returns schemes with pagination
- `GET /api/schemes?schemeType=central` filters central schemes
- `GET /api/schemes/state/jharkhand` returns Jharkhand schemes
- `GET /api/schemes/:slug` returns scheme and increments viewCount
- `GET /api/schemes/search?q=farmer` returns matching schemes
- `GET /api/schemes/:slug/related` returns related schemes

**Database Operations:**
- Scheme creation with all fields
- Scheme retrieval by slug
- Text search index queries
- Pagination with skip/limit
- Filter combinations (type + state)
- Related schemes query (by tags, state, type)

**Example Integration Tests:**

```javascript
// Backend: API endpoint integration
describe('GET /api/schemes', () => {
  beforeEach(async () => {
    await Scheme.deleteMany({});
    await Scheme.create([
      { title: 'Central Scheme 1', slug: 'central-1', schemeType: 'central', ... },
      { title: 'State Scheme 1', slug: 'state-1', schemeType: 'state', state: 'Jharkhand', ... }
    ]);
  });
  
  it('returns all schemes with pagination', async () => {
    const res = await request(app).get('/api/schemes?page=1&limit=10');
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });
  
  it('filters by schemeType', async () => {
    const res = await request(app).get('/api/schemes?schemeType=central');
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].schemeType).toBe('central');
  });
});
```

### Snapshot Tests

**UI Components:**
- SchemeCard with complete data
- SchemeCard with missing optional fields
- SchemeFilters in default state
- SchemeDetail page sections
- Empty state (no schemes found)
- Loading state

**Example Snapshot Test:**

```typescript
describe('SchemeCard snapshots', () => {
  it('matches snapshot with full data', () => {
    const { container } = render(<SchemeCard scheme={fullScheme} />);
    expect(container).toMatchSnapshot();
  });
  
  it('matches snapshot with minimal data', () => {
    const { container } = render(<SchemeCard scheme={minimalScheme} />);
    expect(container).toMatchSnapshot();
  });
});
```

### End-to-End Tests

**User Workflows:**
1. **Browse Schemes**
   - Navigate to /schemes
   - Verify scheme cards display
   - Verify pagination works
   - Click "Next" → page 2 loads

2. **Filter Schemes**
   - Select "Central" filter → only central schemes show
   - Select "Jharkhand" state → Jharkhand schemes show
   - Clear filters → all schemes show

3. **Search Schemes**
   - Enter "farmer" in search → relevant schemes show
   - Enter "invalid query" → empty state shows
   - Clear search → all schemes show

4. **View Scheme Details**
   - Click scheme card → detail page loads
   - Verify all sections present (eligibility, benefits, etc.)
   - Click "Apply Now" → external link opens in new tab
   - Click breadcrumb → returns to listing

5. **Mobile Responsiveness**
   - Open on mobile viewport
   - Verify single-column layout
   - Verify filters are touch-friendly
   - Verify images load optimized sizes

6. **SEO Validation**
   - View page source → meta tags present
   - Verify JSON-LD structured data
   - Test with Google Rich Results Test
   - Verify sitemap includes scheme URLs

**Example E2E Test:**

```typescript
// Using Playwright or Cypress
describe('Schemes E2E', () => {
  it('allows user to browse and view scheme details', async () => {
    await page.goto('/schemes');
    
    // Verify listing page
    await expect(page.locator('h1')).toContainText('Government Schemes');
    const schemeCards = page.locator('.scheme-card');
    await expect(schemeCards).toHaveCount(15);
    
    // Click first scheme
    await schemeCards.first().click();
    await expect(page).toHaveURL(/\/schemes\/[a-z-]+/);
    
    // Verify detail page
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.eligibility-section')).toBeVisible();
    await expect(page.locator('.benefits-section')).toBeVisible();
    
    // Verify apply button
    const applyBtn = page.locator('a:has-text("Apply Online")');
    await expect(applyBtn).toHaveAttribute('target', '_blank');
  });
});
```

### Manual Testing Checklist

**Functionality:**
- [ ] All 15 MVP schemes display correctly on listing page
- [ ] Scheme type filter works (All/Central/State)
- [ ] State dropdown filter works correctly
- [ ] Search returns relevant results
- [ ] Pagination works (Next/Prev buttons)
- [ ] Scheme detail page shows all sections
- [ ] Apply button links to correct external URL
- [ ] Related schemes section displays
- [ ] View count increments on page view

**Data Handling:**
- [ ] Missing thumbnail shows placeholder
- [ ] Missing apply link handled gracefully
- [ ] Missing eligibility shows update message
- [ ] Empty search results show appropriate message
- [ ] Invalid slug shows 404 page

**Responsive Design:**
- [ ] Desktop layout (3 columns)
- [ ] Tablet layout (2 columns)
- [ ] Mobile layout (1 column)
- [ ] Touch-friendly filter controls
- [ ] Images load optimized sizes
- [ ] Text is readable on all screen sizes

**SEO:**
- [ ] Meta title and description present
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] JSON-LD structured data validates
- [ ] Breadcrumb schema present
- [ ] Canonical URLs correct
- [ ] Sitemap includes scheme URLs

**Navigation:**
- [ ] "Government Schemes" link in main menu
- [ ] Breadcrumb navigation works
- [ ] Internal links to related jobs work
- [ ] Footer includes schemes link
- [ ] Homepage shows schemes section

**Performance:**
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Images lazy load
- [ ] No console errors
- [ ] Lighthouse score > 90

### Performance Testing

**Metrics to Monitor:**
- **Page Load Time**: < 2 seconds (First Contentful Paint)
- **API Response Time**: < 500ms for listing, < 300ms for detail
- **Time to Interactive**: < 3 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1

**Optimization Strategies:**
- Image optimization (WebP format, responsive sizes)
- Lazy loading for images below fold
- API response caching (60 seconds)
- Database query optimization (proper indexes)
- Pagination limits (max 50 per page)
- CDN for static assets

**Load Testing:**
- 100 concurrent users browsing schemes
- 1000 requests/minute to API endpoints
- Database query performance under load
- Memory usage monitoring

## Implementation Notes

### Phase 1: Backend Setup
1. Create Scheme model with indexes
2. Implement scheme controller and routes
3. Add validation middleware
4. Seed database with 15 MVP schemes
5. Test API endpoints

### Phase 2: Frontend Pages
1. Create schemes listing page
2. Create scheme detail page
3. Create state-specific page
4. Implement SEO metadata
5. Add structured data

### Phase 3: Components
1. Build SchemeCard component
2. Build SchemeFilters component
3. Build SchemeDetail sections
4. Reuse existing components (Breadcrumb, FAQ, Share)

### Phase 4: Integration
1. Add navigation menu links
2. Update homepage with schemes section
3. Implement internal linking
4. Update global search
5. Update sitemap generation

### Phase 5: Testing & Launch
1. Run unit and integration tests
2. Manual testing on staging
3. SEO validation
4. Performance optimization
5. Production deployment

### Future Enhancements

- Scheme comparison tool
- User bookmarking/favorites
- Email alerts for new schemes
- Scheme application status tracking
- Multi-language support (Hindi, English)
- Advanced filters (by benefit amount, deadline)
- Scheme eligibility calculator
- Mobile app integration
