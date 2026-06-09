# SEO Robots Meta Tag Fix

## Problem
- Google Search Console me 2.99K pages "Not indexed" dikha raha tha
- Job detail pages me robots metadata missing thi
- Active jobs properly indexed nahi ho rahe the

## Solution
Frontend job detail page me robots metadata add ki based on job status:

### Logic
```typescript
const shouldIndex = job.status === 'active';

robots: {
  index: shouldIndex,     // true for active, false for expired/upcoming
  follow: true,           // always follow links
  googleBot: {
    index: shouldIndex,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

## Impact
✅ **Active jobs** (`status: 'active'`) → **indexed by Google** (`robots: index, follow`)
✅ **Expired jobs** (`status: 'expired'`) → **not indexed** (`robots: noindex, follow`)  
✅ **Upcoming jobs** (`status: 'upcoming'`) → **not indexed** (`robots: noindex, follow`)

## Files Modified
- `/frontend/src/app/job/[slug]/page.tsx` - Added robots metadata in generateMetadata function

## Testing
Build successful ✅
Logic verified ✅

## Expected Results
1. Naye active jobs ab properly Google me indexed honge
2. Purane expired jobs gradually Google index se remove ho jayenge
3. "Not indexed" count gradually kam hoga (as Google re-crawls)
4. Search Console me indexing coverage improve hoga

## Notes
- Search pages (`/search?q=...`) already noindex hain - ye intentional hai (thin content se bachne ke liye)
- Job status by default `'active'` hai new jobs ke liye
- MongoDB TTL index automatically jobs delete karta hai X days ke baad
