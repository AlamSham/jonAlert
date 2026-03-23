import { Job } from '../models/Job.js';
import { env } from '../config/env.js';

export const getRssFeed = async (req, res) => {
  try {
    const limit = 30;
    const jobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const siteUrl = env.frontendUrl || 'https://sarkaripulse.com';

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SarkariPulse Jobs</title>
    <link>${siteUrl}</link>
    <description>Latest Sarkari Naukri, Results, and Admit Cards</description>
    <language>en-in</language>
    <atom:link href="${siteUrl}/api/rss.xml" rel="self" type="application/rss+xml" />
`;

    for (const job of jobs) {
      const jobUrl = `${siteUrl}/job/${job.slug}`;
      // Escape special characters for XML
      const title = (job.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (job.summary || job.content || '').substring(0, 300).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '...';
      const pubDate = new Date(job.createdAt).toUTCString();

      rss += `
    <item>
      <title>${title}</title>
      <link>${jobUrl}</link>
      <description>${description}</description>
      <guid>${jobUrl}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }

    rss += `
  </channel>
</rss>`;

    res.header('Content-Type', 'application/rss+xml');
    res.send(rss);
  } catch (error) {
    res.status(500).send('Error generating RSS feed');
  }
};
