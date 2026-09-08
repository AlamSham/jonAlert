#!/usr/bin/env node
/**
 * Optimize Low CTR Pages Script
 * 
 * Updates meta titles and descriptions for pages with low CTR based on GSC data
 * Run: node src/scripts/optimizeLowCTRPages.js
 */

import { connectDb } from '../config/db.js';
import { Job } from '../models/Job.js';
import { logger } from '../utils/logger.js';

// Low CTR / High Impression pages from GSC Excel data with optimized meta tags
const LOW_CTR_OPTIMIZATIONS = [
  {
    slug: 'punjab-sarkari-naukri-2026-bharti-aur-vacancies',
    title: 'Punjab Sarkari Naukri 2026: 10th/12th/Graduate Jobs & Vacancies',
    description: 'Punjab sarkari naukri 2026 notifications — PSSSB, Punjab Police, Health, Education Department vacancies. Eligibility, last date aur apply online links.'
  },
  {
    slug: 'wb-gram-panchayat-bharti-2026-6500-clerk-deo-posts-ke-liye-apply-karein',
    title: 'WB Gram Panchayat Bharti 2026: 6,500 Clerk & DEO Posts — Apply Now',
    description: 'West Bengal Gram Panchayat recruitment 2026 — 6,500 Clerk, DEO & Executive Assistant vacancies. Eligibility, syllabus aur online application process.'
  },
  {
    slug: 'uttarakhand-upcoming-job-vacancies-2025-26-sarkari-jobs-info',
    title: 'Uttarakhand Govt Jobs 2026: UKPSC, UKSSSC Upcoming Vacancies',
    description: 'Uttarakhand sarkari naukri 2026 notifications — UKPSC, UKSSSC, Police, Teacher & Group C recruitment list. Complete eligibility aur apply guide.'
  },
  {
    slug: 'hp-home-guard-recruitment-2026-700-posts-ke-liye-apply-karein',
    title: 'HP Home Guard Recruitment 2026: 700 Posts — Apply Online',
    description: 'Himachal Pradesh Home Guard bharti 2026 — 700 vacancies, 10th pass eligibility, physical standards, salary aur last date. Apply online now.'
  },
  {
    slug: 'upsssc-pharmacist-bharti-2026-564-vacancies-ka-mauka',
    title: 'UPSSSC Pharmacist Bharti 2026: 564 Vacancies — Full Details',
    description: 'UPSSSC Ayurvedic Pharmacist recruitment 2026 — 564 posts, diploma eligibility, pay scale ₹29,200-92,300, cut-off marks aur apply online link.'
  },
  {
    slug: 'dsssb-bharti-2026-delhi-government-jobs-ka-badi-mauka',
    title: 'DSSSB Bharti 2026: Delhi Govt Jobs (Teacher, TGT, PGT, Clerk)',
    description: 'DSSSB Delhi government jobs 2026 notifications — Teacher, Assistant, LDC, Steno vacancies. Scheme of exam, eligibility aur application portal.'
  },
  {
    slug: 'aiims-delhi-laboratory-technician-bharti-2026-apply-karein-online',
    title: 'AIIMS Delhi Lab Technician Bharti 2026: Apply Online Now',
    description: 'AIIMS Delhi Laboratory Technician recruitment 2026 — B.Sc/Diploma eligibility, selection process, exam date aur step-by-step apply guide.'
  },
  {
    slug: 'ap-anganwadi-bharti-2026-2646-posts-ke-liye-aane-wala-hai',
    title: 'AP Anganwadi Bharti 2026: 2,646 Helper & Worker Posts',
    description: 'Andhra Pradesh Anganwadi recruitment 2026 — 2,646 vacancies for Anganwadi Worker & Helper. 10th pass eligibility aur district-wise list.'
  },
  {
    slug: 'cg-mandi-nirikshak-bharti-2026-200-on-ke-liye-exam-date',
    title: 'CG Mandi Nirikshak Bharti 2026: 200 Posts — Exam Date OUT',
    description: 'Chhattisgarh Vyapam Mandi Inspector & Sub Inspector recruitment 2026 — 200 vacancies, exam date, syllabus, admit card aur answer key.'
  },
  {
    slug: 'cg-vyapam-sub-auditor-bharti-2026-ke-liye-69-posts-ki',
    title: 'CG Vyapam Sub Auditor Bharti 2026: 69 Posts — Apply Online',
    description: 'CG Vyapam Sub Auditor recruitment 2026 — 69 vacancies, Commerce graduate eligibility, pay matrix Level 8 aur online form link.'
  },
  {
    slug: 'chandigarh-up-mp-aur-bihar-mein-6-000-nai-bhartiyan',
    title: '6,000+ Sarkari Naukri: Chandigarh, UP, MP, Bihar Bharti 2026',
    description: 'Chandigarh, UP, MP aur Bihar mein 6,000 se zyada naye pado par bharti — eligibility, last date aur online apply link yahan dekhein.'
  },
  {
    slug: '31-000-se-zyada-sarkari-naukriyaan-june-ke-liye-khuli-hain',
    title: '31,000+ Sarkari Naukri June 2026 Mein Khuli — List Dekhein',
    description: 'June 2026 mein 31,000 se zyada sarkari naukriyan open hain. Department-wise list, eligibility aur apply link ek jagah.'
  },
  {
    slug: 'jharkhand-home-guard-bharti-2026-284-posts-ke-liye-apply-karein',
    title: 'Jharkhand Home Guard Bharti 2026: 284 Posts, Apply Now',
    description: 'Jharkhand Home Guard recruitment 2026 — 284 vacancies, eligibility, salary aur last date. Abhi online apply karein, pura process yahan.'
  },
  {
    slug: 'sarkari-jobs-2026-6-badi-bhartiyon-ke-liye-jaldi-apply-karein',
    title: '6 Badi Sarkari Bharti 2026 — Last Date Nazdeek, Apply Karein',
    description: '2026 ki 6 sabse badi sarkari bharti — vacancies, eligibility aur last date ki pura jaankari. Deadline nikalne se pehle apply karein.'
  },
  {
    slug: '10th-pass-youth-ke-liye-sarkari-naukri-ka-mauka-348-posts-ki-bharti',
    title: '10th Pass: 348 Sarkari Naukri Posts — Apply Karein',
    description: '10th pass youth ke liye 348 sarkari naukri posts ki bharti. Eligibility, salary, last date aur apply process yahan dekhein.'
  },
  {
    slug: 'bssc-inter-level-exam-2026-ki-tareekh-aayi-puri-jankari-yahan',
    title: 'BSSC Inter Level Exam 2026 Date OUT — Full Details Here',
    description: 'Bihar SSC Inter Level exam 2026 ki tareekh announce! Exam pattern, syllabus, admit card date aur preparation tips yahan.'
  },
  {
    slug: 'ccrum-delhi-mts-recruitment-2026-out-check-vacancies-apply-online-pw-sarkari-nau',
    title: 'CCRUM Delhi MTS Bharti 2026 — Vacancies, Apply Online',
    description: 'CCRUM Delhi Multi-Tasking Staff recruitment 2026 notification OUT. Vacancy details, eligibility aur online application link.'
  },
  {
    slug: 'mp-sub-engineer-bharti-2026-900-vacancies-exam-june-mein',
    title: 'MP Sub Engineer Bharti 2026: 900 Posts — June Exam',
    description: 'Madhya Pradesh Sub Engineer recruitment 900 vacancies. Exam June mein, eligibility, salary ₹25,500-81,100 aur apply process.'
  },
  {
    slug: 'up-si-bharti-2026-safe-score-aur-minimum-qualifying-marks',
    title: 'UP SI Bharti 2026: Safe Score & Cut-Off Marks Analysis',
    description: 'UP Police SI recruitment safe score prediction, minimum qualifying marks, expected cut-off aur selection strategy.'
  }
];

async function optimizeLowCTRPages() {
  try {
    await connectDb();
    logger.info('Connected to database');

    let updated = 0;
    let notFound = 0;

    for (const opt of LOW_CTR_OPTIMIZATIONS) {
      const job = await Job.findOne({ slug: opt.slug });
      
      if (!job) {
        logger.warn(`❌ Job not found: ${opt.slug}`);
        notFound++;
        continue;
      }

      // Update meta tags safely
      await Job.updateOne(
        { _id: job._id },
        { $set: { metaTitle: opt.title, metaDescription: opt.description } }
      );

      logger.info(`✅ Updated: ${opt.slug}`);
      logger.info(`   Title: ${opt.title}`);
      logger.info(`   Desc: ${opt.description.substring(0, 60)}...`);
      updated++;
    }

    logger.info(`\n✅ Optimization complete!`);
    logger.info(`   Updated: ${updated} pages`);
    logger.info(`   Not found: ${notFound} pages`);
    logger.info(`\n💡 Next steps:`);
    logger.info(`   1. Deploy changes to production`);
    logger.info(`   2. Request reindexing via Google Search Console`);
    logger.info(`   3. Monitor CTR changes over next 2-3 weeks`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Error optimizing pages:', error);
    process.exit(1);
  }
}

optimizeLowCTRPages();
