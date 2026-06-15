import Link from 'next/link';
import { getLatestJobs, getTrendingJobs, getStats, getLatestSchemes, getClosingSoonJobs } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { SchemeCard } from '@/components/SchemeCard';
import { StatsBanner } from '@/components/StatsBanner';
import { SectionHeader } from '@/components/SectionHeader';
import { SearchForm } from '@/components/SearchForm';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { TrendingTags, QualificationLinks } from '@/components/TrendingTags';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustSignals } from '@/components/TrustSignals';
import { getTopStateLinks } from '@/lib/internal-links';
import { CATEGORY_EMOJI } from '@/lib/types';

export const revalidate = 3600;

export default async function HomePage() {
  const [latestJobs, trendingJobs, stats, latestSchemes, closingSoonRes] = await Promise.all([
    getLatestJobs(12),
    getTrendingJobs(6),
    getStats(),
    getLatestSchemes(6).catch(() => []), // Gracefully handle schemes API failure
    getClosingSoonJobs(1, 6).catch(() => ({ data: [], pagination: { total: 0 } })),
  ]);

  const closingSoonJobs = closingSoonRes.data;

  // Generate state links for internal linking
  const stateLinks = getTopStateLinks(stats.topStates || []);

  const categories = [
    { key: 'job', label: 'Sarkari Naukri', emoji: '💼', href: '/jobs', desc: 'Latest govt job notifications' },
    { key: 'admission', label: 'Admission', emoji: '🎓', href: '/admission', desc: 'College admission updates' },
    { key: 'scholarship', label: 'Scholarship', emoji: '💰', href: '/scholarship', desc: 'Sarkari scholarship schemes' },
    { key: 'result', label: 'Results', emoji: '📊', href: '/result', desc: 'Exam results & scorecards' },
    { key: 'admit-card', label: 'Admit Card', emoji: '🎫', href: '/admit-card', desc: 'Download admit cards' },
    { key: 'exam-form', label: 'Exam Form', emoji: '📝', href: '/exam-form', desc: 'Application forms & registration' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-gradient py-12 sm:py-16" id="hero">
        <div className="container-wrap text-center">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Sarkari Naukri Ka <span className="gradient-text">Pulse</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base leading-relaxed">
            UPSC, SSC, Railway, Police, Banking, State Govt Jobs — latest sarkari naukri, admission, scholarship, results aur admit cards ek jagah.
            <br className="hidden sm:block" />
            AI-powered updates har 10 minute. Government schemes, PM Kisan, Ayushman Bharat bhi available. Koi update miss nahi hoga! 🚀
          </p>
          <div className="mt-6 sm:mt-8">
            <SearchForm large />
          </div>
        </div>
      </section>

      <div className="container-wrap py-8 space-y-12">
        {/* Stats */}
        <section id="stats">
          <StatsBanner stats={stats} />
        </section>

        {/* How It Works */}
        <section id="how-it-works">
          <HowItWorks />
        </section>

        {/* Trust Signals - Why SarkariPulse */}
        <section id="trust-signals">
          <TrustSignals />
        </section>

        {/* Category Cards */}
        <section id="categories">
          <SectionHeader title="Browse by Category" icon="📂" />
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                className="card flex items-center gap-4 !p-5 group"
                id={`cat-${cat.key}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-2xl transition group-hover:scale-110">
                  {cat.emoji}
                </span>
                <div>
                  <h3 className="font-bold text-ink group-hover:text-accent transition">
                    {cat.label}
                    {stats.categories[cat.key] != null && (
                      <span className="ml-2 text-xs font-normal text-muted">
                        ({stats.categories[cat.key]})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Tags — Popular Searches */}
        <TrendingTags />

        {/* Jobs by Qualification */}
        <QualificationLinks />

        {/* Top States - Enhanced with internal links */}
        {stateLinks.length > 0 && (
          <section id="top-states">
            <SectionHeader title="Jobs by State" subtitle="State-wise sarkari naukri" icon="📍" />
            <div className="flex flex-wrap gap-2">
              {stateLinks.slice(0, 10).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm transition hover:border-accent hover:text-accent hover:shadow-md"
                >
                  {link.label} {link.count && <span className="ml-1 text-xs text-stone-400">({link.count})</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Closing Soon Jobs */}
        {closingSoonJobs.length > 0 && (
          <section id="closing-soon-section">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader
                title="Closing Soon (Last Date Apply)"
                subtitle="Apply before deadline! Last date is near"
                icon="⏰"
              />
              <Link
                href="/closing-soon"
                className="text-sm font-bold text-red-600 hover:text-red-700 transition inline-flex items-center gap-1"
              >
                View All <span className="animate-pulse">⏰</span>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {closingSoonJobs.slice(0, 6).map((job, i) => (
                <JobCard key={job.slug} job={job} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Jobs */}
        {trendingJobs.length > 0 && (
          <section id="trending">
            <SectionHeader title="Trending Jobs" subtitle="Most viewed notifications" icon="🔥" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trendingJobs.map((job, i) => (
                <JobCard key={job.slug} job={job} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Sarkari Yojana */}
        {latestSchemes.length > 0 && (
          <section id="schemes">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader title="Sarkari Yojana (सरकारी योजना)" subtitle="PM Kisan, Ayushman Bharat aur sabhi yojanaon ki jankari" icon="🏛️" />
              <Link
                href="/schemes"
                className="text-sm font-bold text-accent hover:text-accent-dark transition hidden sm:block"
              >
                Sabhi Yojana Dekhein →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestSchemes.map((scheme, i) => (
                <SchemeCard key={scheme.slug} scheme={scheme} index={i} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/schemes"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-accent-dark active:scale-95"
              >
                Sabhi Sarkari Yojana Dekhein →
              </Link>
            </div>
          </section>
        )}

        {/* Subscribe CTA */}
        <SubscribeCTA />

        {/* Latest Jobs */}
        <section id="latest">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Latest Notifications" subtitle="Real-time updates" icon="⚡" />
            <Link
              href="/jobs"
              className="text-sm font-bold text-accent hover:text-accent-dark transition hidden sm:block"
            >
              View All →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestJobs.map((job, i) => (
              <JobCard key={job.slug} job={job} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/jobs"
              className="inline-block rounded-2xl bg-accent px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark hover:shadow-md"
            >
              View All Jobs →
            </Link>
          </div>
        </section>

        {/* SEO Content Section for Homepage Ranking */}
        <section id="homepage-seo-content" className="border-t border-stone-200 pt-10 mt-12">
          <div className="prose-custom max-w-4xl mx-auto text-sm leading-relaxed text-muted">
            <h2 className="text-xl font-black text-ink mb-4">
              Sarkari Result 2026 & Sarkari Naukri Latest Updates - SarkariPulse
            </h2>
            <p className="mb-4">
              Welcome to <strong>SarkariPulse</strong>, India's leading AI-powered portal for all <strong>Sarkari Result 2026</strong>, <strong>Sarkari Naukri</strong>, government jobs notifications, college admissions, scholarship yojanas, exam forms, and exam answers keys. Humara primary target hai aapko har state aur central government notifications ko real-time update ke saath sabse pehle deliver karna. Hamara advanced platform direct official links, notification PDFs, eligibility criteria, age limits, aur step-by-step apply karne ka tarika pradan karta hai.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 mt-6 mb-6">
              <div>
                <h3 className="font-bold text-ink mb-2">💼 Central & State Government Jobs</h3>
                <p>
                  UPSC (Union Public Service Commission), SSC CGL/CHSL/MTS, Railways (RRB NTPC, Group D, ALP), Banking sector (IBPS, SBI PO/Clerk), Defence (Army, Navy, Airforce), State Police recruitment aur post-graduate sarkari naukri alerts. Chahe aap 10th pass ho, 12th pass ho ya graduate, sabhi qualification-wise jobs yahan direct link ke saath uplabdh hain.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-ink mb-2">📊 Sarkari Result, Cut-Off & Admit Cards</h3>
                <p>
                  Kisi bhi major exams ke results checking, merit lists download, scorecards, previous year question papers aur officially released cut-off marks ko bina kisi hassle ke check karein. Admit card download link release hote hi humare platform par active kar diya jata hai taaki aap exam center ki details turant jaan sakein.
                </p>
              </div>
            </div>

            <h3 className="font-bold text-ink mb-2">🏛️ Sarkari Yojana 2026 (सरकारी योजना) — PM Kisan, Ayushman Bharat, PM Awas</h3>
            <p className="mb-4">
              Sarkari naukri ke saath-saath hum aapko <strong>Kendra Sarkar</strong> aur <strong>Rajya Sarkar</strong> dwara chalai ja rahi sabhi <strong>sarkari yojanaon (Government Schemes)</strong> ki puri jankari dete hain. <strong>PM Kisan Samman Nidhi Yojana</strong> (kisanon ke liye ₹6000/saal), <strong>Ayushman Bharat Yojana</strong> (₹5 lakh tak free ilaaj), <strong>PM Awas Yojana</strong> (ghar banane ke liye subsidy), <strong>Mudra Loan Yojana</strong> (vyapaar ke liye), <strong>Sukanya Samriddhi Yojana</strong> (beti ke bhavishya ke liye), <strong>Atal Pension Yojana</strong>, <strong>Ujjwala Yojana</strong> — sabhi yojanaon ki paatrata (eligibility), labh (benefits), zaroori documents aur online aavedan link yahan available hai. Bilkul free!
            </p>

            <h3 className="font-bold text-ink mb-4">❓ FAQ: Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <p className="font-bold text-ink">Q1. SarkariPulse par sarkari naukri updates kitni der mein update hoti hain?</p>
                <p className="text-muted mt-1">Ans: SarkariPulse par notifications har 10 minute mein AI-powered automated bots ke zariye update kiye jaate hain, taaki aap koi bhi notification miss na karein.</p>
              </div>
              <div className="border-b border-stone-200 pb-3">
                <p className="font-bold text-ink">Q2. Kya hum qualification-wise ya state-wise jobs search kar sakte hain?</p>
                <p className="text-muted mt-1">Ans: Haan! Homepage par Qualification Links (10th pass, 12th pass, Graduate, ITI, etc.) aur Jobs by State categories par click karke aap filter kar sakte hain.</p>
              </div>
              <div>
                <p className="font-bold text-ink">Q3. Yahan par notifications ke documents download karne ka link kahan milta hai?</p>
                <p className="text-muted mt-1">Ans: Har job detail page ke details section mein direct download official PDF notifications aur online application apply links   diye gaye hain.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
