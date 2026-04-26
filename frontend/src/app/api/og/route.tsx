import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const trimParam = (value: string | null, fallback: string, max = 110) => {
  const text = (value || fallback).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trim()}...`;
};

export async function GET(request: Request) {
  const { searchParams, hostname } = new URL(request.url);
  const title = trimParam(searchParams.get('title'), 'SarkariPulse');
  const subtitle = trimParam(
    searchParams.get('org') || searchParams.get('subtitle'),
    'Latest Sarkari Naukri Updates',
    80
  );
  const displayHost = hostname.replace(/^www\./, '');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f8fafc',
          color: '#111827',
          padding: 72,
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 32,
            fontWeight: 800,
            color: '#0f766e'
          }}
        >
          <span>SarkariPulse</span>
          <span
            style={{
              border: '3px solid #f59e0b',
              borderRadius: 999,
              color: '#92400e',
              fontSize: 22,
              padding: '10px 22px'
            }}
          >
            Govt Job Alert
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              color: '#475569',
              fontSize: 34,
              fontWeight: 700
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              fontSize: title.length > 70 ? 54 : 64,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: 0
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#334155',
            fontSize: 28,
            fontWeight: 700
          }}
        >
          <span>Eligibility, dates aur apply details</span>
          <span>{displayHost}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
