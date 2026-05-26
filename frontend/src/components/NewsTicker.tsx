'use client';

import { useEffect, useState } from 'react';
import Link from 'react';
import NextLink from 'next/link';
import { JobListItem } from '@/lib/types';
import { getLatestJobs } from '@/lib/api';

export function NewsTicker() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickerJobs() {
      try {
        const latest = await getLatestJobs(8);
        setJobs(latest);
      } catch (err) {
        console.error('Error fetching ticker jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickerJobs();
  }, []);

  if (loading || jobs.length === 0) {
    return (
      <div className="bg-stone-900 text-stone-300 py-1.5 text-xs font-semibold overflow-hidden border-b border-stone-800">
        <div className="container-wrap flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Loading latest updates...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 text-white py-2 text-xs font-medium border-b border-stone-800 relative z-50">
      <div className="container-wrap flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0 bg-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Trending
        </div>

        {/* Marquee Content */}
        <div className="relative flex-grow overflow-hidden h-5 flex items-center">
          <div className="animate-marquee whitespace-nowrap flex gap-12 hover:[animation-play-state:paused] cursor-pointer">
            {jobs.map((job) => (
              <NextLink
                key={job.slug}
                href={`/job/${job.slug}`}
                className="hover:text-accent transition-colors duration-150 inline-flex items-center gap-1.5"
              >
                <span className="text-stone-400">•</span>
                <span>{job.title}</span>
                {job.vacancyCount > 0 && (
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded font-bold text-accent">
                    {job.vacancyCount} posts
                  </span>
                )}
              </NextLink>
            ))}
          </div>
          {/* Double list for seamless loop */}
          <div className="animate-marquee2 absolute top-0 whitespace-nowrap flex gap-12 hover:[animation-play-state:paused] cursor-pointer h-full items-center">
            {jobs.map((job) => (
              <NextLink
                key={`${job.slug}-dup`}
                href={`/job/${job.slug}`}
                className="hover:text-accent transition-colors duration-150 inline-flex items-center gap-1.5"
              >
                <span className="text-stone-400">•</span>
                <span>{job.title}</span>
                {job.vacancyCount > 0 && (
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded font-bold text-accent">
                    {job.vacancyCount} posts
                  </span>
                )}
              </NextLink>
            ))}
          </div>
        </div>

        {/* Right CTA Links */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <NextLink
            href="/today"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition text-[11px]"
          >
            📅 Aaj Ki Naukri
          </NextLink>
          <NextLink
            href="/closing-soon"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition text-[11px]"
          >
            ⏰ Closing Soon
          </NextLink>
        </div>
      </div>
    </div>
  );
}
