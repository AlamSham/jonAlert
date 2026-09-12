import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  let backendStatus = 'unknown';

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/health`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'SarkariPulse-WarmupBot/1.0' },
      signal: AbortSignal.timeout(4000),
    });
    backendStatus = res.ok ? 'healthy' : `http_${res.status}`;
  } catch (error: any) {
    backendStatus = `unreachable: ${error.message}`;
  }

  return NextResponse.json(
    {
      status: 'ok',
      frontend: 'warm',
      backend: backendStatus,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store',
      },
    }
  );
}
