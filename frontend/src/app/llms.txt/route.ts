import { NextResponse } from 'next/server';
import { getLatestJobs, getJobsByCategory, getLatestSchemes, getStats } from '@/lib/api';
import { guides } from '@/lib/guides';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  try {
    const [latestJobs, resultsRes, admitCardsRes, schemes, stats] = await Promise.all([
      getLatestJobs(25).catch(() => []),
      getJobsByCategory('result', 1, 15).catch(() => ({ data: [] })),
      getJobsByCategory('admit-card', 1, 15).catch(() => ({ data: [] })),
      getLatestSchemes(10).catch(() => []),
      getStats().catch(() => null),
    ]);

    const results = resultsRes?.data || [];
    const admitCards = admitCardsRes?.data || [];

    const markdown = `# SarkariPulse — Verified Sarkari Naukri, Admit Card & Result Portal
> SarkariPulse (${siteUrl}) is India's premier verified portal for government job notifications (Sarkari Naukri), competitive exam results, admit cards, answer keys, syllabus, and central/state welfare schemes. All content is structured for accuracy, clarity, and direct official reference.

## Website Overview & Primary Resources
- [Home Page](${siteUrl}): Central hub for latest sarkari naukri, trending recruitment notifications, and daily alerts.
- [Sarkari Naukri / All Jobs](${siteUrl}/jobs): Comprehensive directory of active government vacancies across central and state departments.
- [Sarkari Results](${siteUrl}/result): Latest scorecards, merit lists, and cut-off marks for competitive exams.
- [Admit Cards](${siteUrl}/admit-card): Hall tickets, exam city slips, and exam day instruction guidelines.
- [Admissions](${siteUrl}/admission): College and university admissions, counselling schedules, and entrance forms.
- [Scholarships](${siteUrl}/scholarship): State and national scholarship schemes for 10th, 12th, and college students.
- [Sarkari Schemes](${siteUrl}/schemes): Central & state government welfare schemes (PM Kisan, Ayushman Bharat, etc.).
- [Full LLM Knowledge Dump](${siteUrl}/llms-full.txt): Complete detailed text dump of active jobs, eligibility, salary, and official portals for AI consumption.

## Active Government Jobs (Sarkari Naukri 2026)
${latestJobs.length > 0 ? latestJobs.map(job => {
  const meta = [
    job.organization ? `Org: ${job.organization}` : null,
    job.vacancyCount ? `${job.vacancyCount.toLocaleString('en-IN')} Posts` : null,
    job.state ? `State: ${job.state}` : null,
  ].filter(Boolean).join(' | ');
  return `- [${job.title}](${siteUrl}/job/${job.slug})${meta ? ` — ${meta}` : ''}: ${job.summary || 'Official notification details, qualification criteria, and online apply link.'}`;
}).join('\n') : '- No active jobs currently listed.'}

## Latest Exam Results & Merit Lists
${results.length > 0 ? results.map(res => {
  return `- [${res.title}](${siteUrl}/job/${res.slug}): Exam result, official scorecard download link, and merit list criteria.`;
}).join('\n') : '- No recent results currently listed.'}

## Admit Cards & Hall Tickets
${admitCards.length > 0 ? admitCards.map(card => {
  return `- [${card.title}](${siteUrl}/job/${card.slug}): Hall ticket release date, exam date, and official download link.`;
}).join('\n') : '- No recent admit cards currently listed.'}

## Government Schemes & Welfare Initiatives
${schemes.length > 0 ? schemes.map(s => {
  return `- [${s.title}](${siteUrl}/schemes/${s.slug}): ${s.summary || 'Benefits, eligibility criteria, required documents, and official application process.'}`;
}).join('\n') : '- No schemes currently listed.'}

## Competitive Exam Guides & Syllabus
${guides.map(g => {
  return `- [${g.title}](${siteUrl}/guides/${g.slug}): ${g.description}`;
}).join('\n')}

## Browse by State Portals
${(stats?.topStates?.map(s => s.state) || ['Uttar Pradesh', 'Bihar', 'Delhi', 'Rajasthan', 'Madhya Pradesh', 'Uttarakhand', 'Punjab', 'West Bengal', 'Haryana', 'Jharkhand']).map(stateName => {
  return `- [${stateName} Govt Jobs](${siteUrl}/jobs/state/${encodeURIComponent(stateName)}): Latest recruitment notifications and public service commission alerts for ${stateName}.`;
}).join('\n')}

## Direct Official Portals Reference
- UPSC: https://upsc.gov.in (Civil Services, NDA, CDS, CMS)
- SSC: https://ssc.gov.in (CGL, CHSL, MTS, GD Constable, CPO)
- Railway Recruitment: https://indianrailways.gov.in (RRB NTPC, Group D, ALP, JE)
- IBPS: https://ibps.in (Bank PO, Clerk, SO, RRB Office Assistant)
- National Testing Agency: https://nta.ac.in (NEET, JEE, UGC NET, CUET)
`;

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    return new NextResponse(`# SarkariPulse — Verified Sarkari Naukri & Results\n\nError generating dynamic llms.txt: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}
