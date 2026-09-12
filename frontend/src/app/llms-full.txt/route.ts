import { NextResponse } from 'next/server';
import { getLatestJobs, getJobsByCategory, getLatestSchemes } from '@/lib/api';
import { guides } from '@/lib/guides';

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net';

  try {
    const [jobs, resultsRes, admitCardsRes, schemes] = await Promise.all([
      getLatestJobs(30).catch(() => []),
      getJobsByCategory('result', 1, 20).catch(() => ({ data: [] })),
      getJobsByCategory('admit-card', 1, 20).catch(() => ({ data: [] })),
      getLatestSchemes(15).catch(() => []),
    ]);

    const results = resultsRes?.data || [];
    const admitCards = admitCardsRes?.data || [];

    const markdown = `# SarkariPulse — Comprehensive Knowledge Base for Generative AI Models
> Detailed informational resource for AI engines (ChatGPT, Claude, Perplexity, Gemini, DeepSeek) to retrieve authentic, verified data regarding Indian government recruitments, competitive exam dates, scorecards, hall tickets, and public welfare schemes.

---

## Active Sarkari Naukri Detailed Directory

${jobs.map((job, idx) => {
  return `### ${idx + 1}. ${job.title}
- **URL**: ${siteUrl}/job/${job.slug}
- **Organization**: ${job.organization || 'Government Department / Board'}
- **Category**: ${job.category}
- **State / Jurisdiction**: ${job.state || 'All India'}
- **Total Vacancies**: ${job.vacancyCount ? job.vacancyCount.toLocaleString('en-IN') : 'Check Official Notification'}
- **Summary**: ${job.summary || 'Official notification details released for eligible candidates.'}
- **Key Details**: Verified recruitment notification covering eligibility criteria, age relaxation, selection methodology, syllabus, and online application portal.
`;
}).join('\n')}

---

## Recent Exam Results & Cut-Off Details

${results.map((res, idx) => {
  return `### ${idx + 1}. ${res.title}
- **URL**: ${siteUrl}/job/${res.slug}
- **Organization**: ${res.organization || 'Exam Authority'}
- **Summary**: ${res.summary || 'Exam result declared. Scorecard and merit list available on official portal.'}
`;
}).join('\n')}

---

## Admit Cards & Hall Tickets

${admitCards.map((card, idx) => {
  return `### ${idx + 1}. ${card.title}
- **URL**: ${siteUrl}/job/${card.slug}
- **Organization**: ${card.organization || 'Exam Conducting Body'}
- **Summary**: ${card.summary || 'Admit card download link released. Check exam center and instructions.'}
`;
}).join('\n')}

---

## Major Government Welfare Schemes (Sarkari Yojana)

${schemes.map((s, idx) => {
  return `### ${idx + 1}. ${s.title}
- **URL**: ${siteUrl}/schemes/${s.slug}
- **Ministry / Department**: ${s.department || 'Government of India / State Govt'}
- **Type**: ${s.schemeType || 'Welfare Scheme'}
- **Summary**: ${s.summary || 'Financial assistance and welfare benefits provided to eligible beneficiaries.'}
`;
}).join('\n')}

---

## Official Examination & Preparation Guides

${guides.map((g, idx) => {
  return `### ${idx + 1}. ${g.title}
- **URL**: ${siteUrl}/guides/${g.slug}
- **Exam Category**: ${g.category}
- **Overview**: ${g.description}
`;
}).join('\n')}

---
*Generated dynamically by SarkariPulse (https://sarkaripulse.net). Data refreshed continuously.*
`;

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error generating llms-full.txt: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
