import { generateFAQSchema, jobPostingJsonLd, generateArticleSchema, formatDate, generateJobPageTitle, generateJobMetaDescription } from './src/lib/seo.js';
import { generateJobContextualLinks, generateBreadcrumbLinks } from './src/lib/internal-links.js';

import fs from 'fs';

// Run from within frontend folder
async function run() {
  const payload = {
    "_id": "6a052b7e6c54138b1fc0e243",
    "title": "AFCAT 02/2026 ke liye applications shuru, 300+ vacancies hain!",
    "slug": "afcat-02-2026-ke-liye-applications-shuru-300-vacancies-hain",
    "content": "Agar aap Indian Air Force mein join karna chahte hain, toh AFCAT 02/2026 ki bharti ka mauka mat chhodiye! Is baar 300 se zyada vacancies hain. Koi bhi graduate jo 20 se 24 saal ke beech hai, woh ismein apply kar sakta hai. Apply karne ke liye online form bharna hoga, jo ki 20 May se shuru hoga. Fees 250 rupees hai. Aapko form bharte waqt apni identity proof, educational documents aur passport size photo upload karni hogi. Last date hai 19 June. Toh jaldi karein aur apne sapne ko sach karein!",
    "summary": "AFCAT 02/2026 ke liye applications 20 May se shuru, 300+ vacancies hain. Jaldi apply karein!",
    "eligibility": "Age: 20-24 saal, Education: Graduate, Category: All candidates can apply",
    "importantDates": "20 May se 19 June tak apply kar sakte hain",
    "category": "job",
    "state": "All India",
    "organization": "Indian Air Force",
    "vacancyCount": 300,
    "lastDate": "2026-06-19T00:00:00.000Z",
    "qualificationLevel": "graduate",
    "applyLink": "https://news.google.com/rss/articles/CBMi9gJ...",
    "salary": "",
    "viewCount": 27,
    "metaTitle": "AFCAT 02/2026 Apply Karein, 300+ Vacancies Available",
    "metaDescription": "AFCAT 02/2026 ke liye applications 20 May se shuru, 300+ vacancies hain. Apply karne ki details yahan dekhein.",
    "tags": ["jobs", "Indian Air Force", "AFCAT", "vacancies", "All India"],
    "status": "active",
    "sourceId": "ac95a905b4c8a3352960e6caa7996199faa7dc75",
    "contentFingerprint": "57ae8ca352f2ae44bcc546466e27342b6630ced4",
    "sourceUrl": "https://news.google.com/rss/articles/...",
    "sourceName": "Central Air Force Jobs",
    "publishedAt": "2026-05-13T12:52:49.000Z",
    "createdAt": "2026-05-14T01:55:11.141Z"
  };

  try {
    console.log("formatDate:");
    formatDate(payload.lastDate);

    console.log("generateJobPageTitle:");
    generateJobPageTitle(payload);

    console.log("generateJobMetaDescription:");
    generateJobMetaDescription(payload);

    console.log("generateFAQSchema:");
    generateFAQSchema(payload);

    console.log("jobPostingJsonLd:");
    jobPostingJsonLd(payload);

    console.log("generateArticleSchema:");
    generateArticleSchema(payload);

    console.log("generateJobContextualLinks:");
    generateJobContextualLinks(payload);

    console.log("ALL TESTS PASSED!");
  } catch (err) {
    console.error("ERROR DETECTED:", err);
  }
}

run();
