import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Fix 1: Redirect /result?page=1 to /result (remove duplicate canonical)
  // This fixes "Duplicate without user-selected canonical" issue
  if (url.searchParams.has('page')) {
    const page = url.searchParams.get('page');
    if (page === '1' || page === '0') {
      url.searchParams.delete('page');
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
  }
  
  // Fix 2: Force trailing slash consistency (if needed)
  // Uncomment if you want all URLs to end with /
  // if (!url.pathname.endsWith('/') && !url.pathname.includes('.')) {
  //   url.pathname += '/';
  //   return NextResponse.redirect(url, 301);
  // }
  
  // Fix 3: Lowercase URLs for consistency
  if (url.pathname !== url.pathname.toLowerCase()) {
    url.pathname = url.pathname.toLowerCase();
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
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
