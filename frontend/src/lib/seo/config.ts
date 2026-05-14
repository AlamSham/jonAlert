// SEO Configuration and Constants

export const SEO_CONFIG = {
  // Site Configuration
  SITE_NAME: 'SarkariPulse',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkaripulse.net',
  
  // CTR Optimization Limits
  MAX_TITLE_LENGTH: 60,
  MAX_DESCRIPTION_LENGTH: 155,
  MIN_DESCRIPTION_LENGTH: 120,
  
  // Performance Thresholds
  CORE_WEB_VITALS: {
    LCP_THRESHOLD: 2.5, // seconds
    FID_THRESHOLD: 100, // milliseconds
    CLS_THRESHOLD: 0.1,
  },
  
  // CTR Targets
  CTR_TARGETS: {
    CURRENT: 0.003, // 0.3%
    TARGET_MIN: 0.02, // 2%
    TARGET_MAX: 0.05, // 5%
  },
  
  // Indexing Targets
  INDEXING_TARGETS: {
    CURRENT: 21,
    TARGET: 35,
  },
  
  // Cache Configuration
  CACHE: {
    TTL: {
      SEO_DATA: 3600, // 1 hour
      STRUCTURED_DATA: 7200, // 2 hours
      PERFORMANCE_METRICS: 1800, // 30 minutes
      GSC_DATA: 21600, // 6 hours
      CONTENT: 14400, // 4 hours
    },
    MAX_SIZE: 1000,
    KEY_PREFIX: 'seo:',
  },
  
  // Alert Thresholds
  ALERTS: {
    CTR_DROP_BELOW: 0.015, // 1.5%
    INDEXED_PAGES_BELOW: 30,
    LCP_ABOVE: 3.0, // seconds
    CLS_ABOVE: 0.15,
    CRAWL_ERRORS_ABOVE: 10,
    POSITION_DROP_BELOW: 20,
    TRAFFIC_DROP_BELOW: -0.1, // -10%
  },
  
  // API Configuration
  APIS: {
    GOOGLE_SEARCH_CONSOLE: {
      RATE_LIMIT: 1200, // requests per day
      BATCH_SIZE: 25, // URLs per batch
      BASE_URL: 'https://searchconsole.googleapis.com/webmasters/v3',
      INDEXING_API_URL: 'https://indexing.googleapis.com/v3',
      SCOPES: [
        'https://www.googleapis.com/auth/webmasters',
        'https://www.googleapis.com/auth/indexing'
      ]
    },
    BING_WEBMASTER: {
      RATE_LIMIT: 10000, // requests per day
      BATCH_SIZE: 10,
      BASE_URL: 'https://ssl.bing.com/webmaster/api.svc/json'
    },
  },
} as const;

// Emotional Triggers for CTR Optimization
export const EMOTIONAL_TRIGGERS = {
  URGENCY: [
    '🔥', '⚡', '🚨', '⏰', '💥',
    'BREAKING', 'URGENT', 'LAST CHANCE', 'LIMITED TIME', 'HURRY'
  ],
  EXCITEMENT: [
    '🎉', '🚀', '✨', '🎯', '💫',
    'AMAZING', 'INCREDIBLE', 'FANTASTIC', 'AWESOME', 'SPECTACULAR'
  ],
  TRUST: [
    '✅', '🏆', '⭐', '🔒', '💯',
    'VERIFIED', 'TRUSTED', 'OFFICIAL', 'GUARANTEED', 'CERTIFIED'
  ],
  BENEFIT: [
    '💰', '🎁', '📈', '🏅', '💎',
    'FREE', 'BONUS', 'EXCLUSIVE', 'PREMIUM', 'SPECIAL'
  ],
} as const;

// Hinglish Keywords and Phrases
export const HINGLISH_TERMS = {
  ACTIONS: [
    'kaise karein', 'kaise paye', 'kaise milegi', 'check karein', 'apply karein',
    'download karein', 'bhariye', 'dekhiye', 'padhiye', 'samjhiye'
  ],
  URGENCY: [
    'jaldi', 'turant', 'abhi', 'last date', 'miss mat kariye',
    'der mat kariye', 'time kam hai', 'deadline near'
  ],
  BENEFITS: [
    'free mein', 'bilkul free', 'koi charge nahi', 'instant update',
    'har 10 minute', 'latest notification', 'sabse pehle'
  ],
  QUESTIONS: [
    'kya hai', 'kaise hai', 'kab hai', 'kahan hai', 'kitna hai',
    'kaun apply kar sakta hai', 'eligibility kya hai'
  ],
  COMMON_PHRASES: [
    'sarkari naukri', 'govt jobs', 'bharti', 'vacancy', 'notification',
    'result', 'admit card', 'hall ticket', 'scorecard', 'merit list'
  ],
} as const;

// Page Type Templates
export const PAGE_TEMPLATES = {
  JOB_DETAIL: {
    TITLE: '{emoji} {title} - {organization} | {vacancies} Posts | SarkariPulse',
    DESCRIPTION: '{title} notification by {organization}. {vacancies} vacancies. Last date: {lastDate}. {hinglish_cta}',
  },
  CATEGORY: {
    TITLE: '{emoji} Latest {category} 2026 - {count}+ Notifications | SarkariPulse',
    DESCRIPTION: '{emoji} {count}+ Latest {category}! Daily updates, instant alerts. {hinglish_benefit} {urgency_cta}',
  },
  STATE: {
    TITLE: '{emoji} {state} {category} 2026 - {count}+ Jobs | SarkariPulse',
    DESCRIPTION: '{emoji} {count}+ {category} in {state}! State govt + central jobs. {hinglish_benefit} Apply now!',
  },
  RESULT: {
    TITLE: '{emoji} {title} Result 2026 - Scorecard Download | SarkariPulse',
    DESCRIPTION: '{title} result declared! Download scorecard, check merit list, cut-off marks. {hinglish_cta}',
  },
  ADMIT_CARD: {
    TITLE: '{emoji} {title} Admit Card 2026 - Hall Ticket Download | SarkariPulse',
    DESCRIPTION: '{title} admit card available! Download hall ticket, check exam center, reporting time. {hinglish_cta}',
  },
  SCHEME: {
    TITLE: '{emoji} {title} - Eligibility, Benefits, Apply Online | SarkariPulse',
    DESCRIPTION: '{title} scheme details - eligibility criteria, benefits, application process. {hinglish_cta}',
  },
} as const;

// FAQ Templates by Category
export const FAQ_TEMPLATES = {
  JOBS: [
    {
      question: 'SarkariPulse par kitni government jobs available hain?',
      answerTemplate: 'Currently {count} sarkari naukri notifications available hain. Har din nayi vacancies add hoti rehti hain.'
    },
    {
      question: 'Kya yahan par latest job notifications milte hain?',
      answer: 'Haan bilkul! Humara AI system har 10 minute mein check karta hai aur latest notifications instantly update karta hai. Aap ko sabse pehle updates mil jaate hain.'
    },
    {
      question: 'Job apply karne ke liye kya karna hoga?',
      answer: 'Job card par click kariye, complete details padhiye, eligibility check kariye, aur "Apply Now" button par click karke official website par jaayiye. Wahan online form bhariye.'
    },
    {
      question: 'Kya SarkariPulse ki service free hai?',
      answer: 'Haan, SarkariPulse 100% free hai. Koi hidden charges nahi hain. Aap free mein latest notifications, alerts, aur job details dekh sakte hain.'
    },
    {
      question: 'State wise jobs kaise search karein?',
      answer: 'Aap search box mein state name type kar sakte hain ya phir job cards mein state filter use kar sakte hain. Har state ke liye separate page bhi available hai.'
    },
    {
      question: 'Notification ki authenticity kaise check karein?',
      answer: 'Har notification mein official website ka link diya gaya hai. "Apply Now" button par click karke direct official website par jaa sakte hain. Fake notifications se bachiye.'
    },
    {
      question: 'Mobile mein notifications kaise receive karein?',
      answer: 'SarkariPulse app download kariye ya website par notification allow kariye. Instant push notifications milenge jaise hi koi nayi vacancy aayegi.'
    },
    {
      question: 'Qualification wise jobs kaise filter karein?',
      answer: 'Search box mein apni qualification type kariye jaise "10th pass", "12th pass", "graduate", "ITI", "diploma". Relevant jobs filter ho jaayengi.'
    }
  ],
  RESULTS: [
    {
      question: 'Sarkari exam result kaise check karein?',
      answer: 'Official website par jaayiye, result link par click kariye, roll number/registration number enter kariye, aur submit button dabayiye. Result screen par aa jaayega.'
    },
    {
      question: 'Result mein kya information milti hai?',
      answer: 'Roll number, candidate name, marks obtained, total marks, percentage/grade, rank (agar applicable hai), aur qualifying status (Pass/Fail) ki information milti hai.'
    },
    {
      question: 'Scorecard download kaise karein?',
      answer: 'Result check karne ke baad "Download Scorecard" option par click kariye. PDF file download ho jaayegi. Print kar ke safe rakhiye.'
    },
    {
      question: 'Cut-off marks kya hote hain?',
      answer: 'Cut-off marks minimum qualifying marks hote hain jo pass hone ke liye zaroori hain. Ye category wise alag hote hain (General, OBC, SC, ST).'
    },
    {
      question: 'Result mein discrepancy hai to kya karein?',
      answer: 'Official website par grievance/complaint section mein jaayiye, form bhariye, supporting documents attach kariye, aur submit kar diye. Time limit ke andar complaint kariye.'
    }
  ],
  ADMIT_CARDS: [
    {
      question: 'Admit card download kaise karein?',
      answer: 'Official website par jaayiye, "Download Admit Card" link par click kariye, registration number aur date of birth enter kariye, captcha fill kariye, aur download button dabayiye.'
    },
    {
      question: 'Admit card mein kya information hoti hai?',
      answer: 'Candidate ka naam, photo, signature, roll number, exam center address, exam date aur time, reporting time, aur exam instructions ki complete details hoti hai.'
    },
    {
      question: 'Admit card print karna zaroori hai?',
      answer: 'Haan bilkul! Bina admit card ke exam center mein entry nahi milti. Clear print kariye aur exam ke din saath le jaayiye. Mobile mein soft copy bhi rakh sakte hain backup ke liye.'
    },
    {
      question: 'Admit card mein error hai to kya karein?',
      answer: 'Turant official website par helpline number par call kariye ya email kariye. Correction window agar available hai to online correction kar sakte hain.'
    },
    {
      question: 'Exam center change kar sakte hain?',
      answer: 'Usually exam center change nahi hota. Sirf special circumstances mein (medical emergency, natural disaster) change possible hai. Official notification check kariye.'
    }
  ],
  SCHEMES: [
    {
      question: 'Government scheme ke liye kaise apply karein?',
      answer: 'Scheme details page par jaayiye, eligibility criteria check kariye, required documents ready rakhiye, aur "Apply Online" button par click karke official website par jaayiye. Wahan application form bhariye aur submit kariye.'
    },
    {
      question: 'Kya scheme ki eligibility check kar sakte hain?',
      answer: 'Haan, har scheme ke detail page par complete eligibility criteria di gayi hai. Aap apni age, income, qualification, aur category check kar sakte hain.'
    },
    {
      question: 'Popular government schemes kaun kaun si hain?',
      answer: 'Popular schemes: PM Kisan Samman Nidhi (farmers), Ayushman Bharat (health), PM Awas Yojana (housing), Mudra Loan (business), Sukanya Samriddhi (girl child).'
    },
    {
      question: 'Kya schemes free hain?',
      answer: 'Haan, government schemes apply karna completely free hai. Koi application fee nahi lagti. Agar koi agent paisa maange to fraud hai. Direct official website se apply karein.'
    }
  ]
} as const;

// Structured Data Templates
export const STRUCTURED_DATA_CONFIG = {
  ORGANIZATION: {
    name: 'SarkariPulse',
    url: 'https://sarkaripulse.net',
    logo: 'https://sarkaripulse.net/logo.jpg',
    description: 'AI-powered sarkari job notification portal — latest govt jobs, results, admit cards, admissions, scholarships in India.',
    foundingDate: '2024',
    areaServed: 'India',
    serviceType: 'Government Job Information Service',
    contactPoint: {
      contactType: 'customer support',
      url: 'https://sarkaripulse.net/contact',
      availableLanguage: ['Hindi', 'English']
    }
  },
  
  WEBSITE: {
    name: 'SarkariPulse',
    url: 'https://sarkaripulse.net',
    description: 'Latest Sarkari Naukri, Exam Results, Admit Cards — AI-powered updates in Hinglish',
    searchAction: {
      target: 'https://sarkaripulse.net/search?q={search_term_string}',
      queryInput: 'required name=search_term_string'
    }
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  CTR_OPTIMIZER: {
    TITLE_TOO_LONG: 'Generated title exceeds 60 character limit',
    DESCRIPTION_TOO_LONG: 'Generated description exceeds 155 character limit',
    MISSING_KEYWORDS: 'No keywords provided for optimization',
    GENERATION_FAILED: 'Failed to generate optimized content'
  },
  
  SCHEMA_GENERATOR: {
    VALIDATION_FAILED: 'Schema validation failed',
    MISSING_REQUIRED_FIELDS: 'Required fields missing for schema generation',
    INVALID_SCHEMA_TYPE: 'Invalid schema type requested'
  },
  
  INDEXING_MANAGER: {
    SITEMAP_GENERATION_FAILED: 'Failed to generate sitemap',
    GSC_API_ERROR: 'Google Search Console API error',
    INDEXING_REQUEST_FAILED: 'Failed to request indexing'
  },
  
  PERFORMANCE_MONITOR: {
    METRICS_FETCH_FAILED: 'Failed to fetch performance metrics',
    THRESHOLD_EXCEEDED: 'Performance threshold exceeded',
    ALERT_SEND_FAILED: 'Failed to send performance alert'
  }
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CTR_OPTIMIZER: {
    TITLE_OPTIMIZED: 'Title successfully optimized for CTR',
    DESCRIPTION_OPTIMIZED: 'Meta description successfully optimized',
    AB_TEST_STARTED: 'A/B test successfully started'
  },
  
  INDEXING_MANAGER: {
    SITEMAP_SUBMITTED: 'Sitemap successfully submitted to search engines',
    INDEXING_REQUESTED: 'Indexing successfully requested for URLs',
    PAGES_INDEXED: 'Pages successfully indexed'
  },
  
  PERFORMANCE_MONITOR: {
    METRICS_UPDATED: 'Performance metrics successfully updated',
    REPORT_GENERATED: 'SEO report successfully generated',
    ALERT_SENT: 'Performance alert successfully sent'
  }
} as const;

// Content Templates for Content_Enhancer
export const CONTENT_TEMPLATES = {
  INTRODUCTORY: {
    job: [
      'Latest {category} notifications for {year} are now available! हमारी website पर सभी government jobs की complete information मिलती है। Daily updates के साथ instant notifications भी receive करें।',
      '{category} में career बनाने के लिए यहाँ सभी opportunities available हैं। {year} में {month} तक कई नई vacancies आई हैं। Apply करने से पहले eligibility criteria जरूर check करें।',
      'Government sector में {category} jobs की demand हमेशा high रहती है। Job security, good salary, और benefits के साथ यहाँ excellent career opportunities हैं। Latest updates के लिए regular check करते रहें।'
    ],
    scheme: [
      'Government schemes के through citizens को various benefits मिलते हैं। {category} category में कई helpful schemes available हैं जो {year} में launch हुई हैं। Apply करने के लिए eligibility check करें।',
      '{category} schemes का benefit उठाने के लिए eligibility criteria check करना जरूरी है। Application process simple है और completely online होती है। Documents ready रखें।',
      'Central और state government दोनों levels पर {category} के लिए schemes चलाई जा रही हैं। Free application के साथ direct benefits मिलते हैं। Latest updates के लिए check करते रहें।'
    ],
    result: [
      '{category} results की latest updates यहाँ मिलती हैं। Scorecard download करने के साथ merit list भी check कर सकते हैं। Result declare होने पर instant notification मिलता है।',
      'Exam results declare होने के तुरंत बाद यहाँ update हो जाते हैं। Cut-off marks और qualifying criteria की complete information available है। Merit list भी check कर सकते हैं।',
      'Result check करने के साथ next process की जानकारी भी मिलती है। Document verification और counseling की dates भी update होती रहती हैं। Latest updates के लिए regular check करें।'
    ]
  }
} as const;
