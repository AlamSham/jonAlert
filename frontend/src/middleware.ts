import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;
  
  // Protection: Block aggressive AI scrapers & bad bots immediately (saves Cloud Run CPU/bill)
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const blockedBots = [
    'bytespider',
    'petalbot',
    'mj12bot',
    'dotbot',
    'gptbot',
    'claudebot',
    'ccbot',
    'diffbot',
    'cohere-ai',
    'amazonbot',
  ];
  if (blockedBots.some(bot => userAgent.includes(bot))) {
    return new NextResponse('Forbidden: AI scraping not allowed', { status: 403 });
  }

  // Fix 1: Redirect /result?page=1 to /result (remove duplicate canonical)
  // This fixes "Duplicate without user-selected canonical" issue
  if (searchParams.has('page')) {
    const page = searchParams.get('page');
    if (page === '1' || page === '0') {
      searchParams.delete('page');
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
  }
  
  const response = NextResponse.next();


  // Fix 3: Pagination rel=prev/next Link headers for SEO
  // Helps Google understand paginated series without duplicate content confusion
  const paginatedPaths = ['/jobs', '/result', '/admit-card', '/admission', '/scholarship', '/exam-form', '/closing-soon', '/today', '/schemes'];
  if (paginatedPaths.some(p => pathname === p) && searchParams.has('page')) {
    const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';
    const linkHeaders: string[] = [];

    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevUrl = prevPage === 1 ? `${siteUrl}${pathname}` : `${siteUrl}${pathname}?page=${prevPage}`;
      linkHeaders.push(`<${prevUrl}>; rel="prev"`);
    }

    // Always add next (Google will discover the end naturally)
    const nextUrl = `${siteUrl}${pathname}?page=${currentPage + 1}`;
    linkHeaders.push(`<${nextUrl}>; rel="next"`);

    if (linkHeaders.length > 0) {
      response.headers.set('Link', linkHeaders.join(', '));
    }
  }

  // Fix 4: X-Robots-Tag for low-value pages to save crawl budget
  // Search pages with empty/garbage queries should not be indexed
  if (pathname === '/search') {
    const query = searchParams.get('q') || '';
    const trimmedQuery = query.trim();
    
    // Noindex empty searches, single-character, or template placeholder queries
    if (
      !trimmedQuery ||
      trimmedQuery.length < 2 ||
      trimmedQuery === '{search_term_string}' ||
      /^[^a-zA-Z0-9\u0900-\u097F]+$/.test(trimmedQuery) // Only special characters (including Hindi Unicode check)
    ) {
      response.headers.set('X-Robots-Tag', 'noindex, follow');
    }
  }

  // Fix 5: Noindex paginated pages beyond page 5 (deep pagination = thin content)
  if (searchParams.has('page')) {
    const pageNum = Number(searchParams.get('page')) || 1;
    if (pageNum > 5) {
      response.headers.set('X-Robots-Tag', 'noindex, follow');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
