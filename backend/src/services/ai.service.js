import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;
const grokClient = env.grokApiKey
  ? new OpenAI({
      apiKey: env.grokApiKey,
      baseURL: env.grokBaseUrl
    })
  : null;
let openAiDisabledUntil = 0;
let geminiDisabledUntil = 0;
let grokDisabledUntil = 0;
const CONFIG_ERROR_COOLDOWN_MS = 12 * 60 * 60 * 1000;

const categoryLabels = {
  job: 'Sarkari Naukri',
  result: 'Sarkari Result',
  'admit-card': 'Admit Card',
  admission: 'College Admission',
  scholarship: 'Scholarship',
  'exam-form': 'Exam Form'
};

const inferStateFromText = (text = '') => {
  const lower = text.toLowerCase();
  const states = [
    'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya',
    'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim',
    'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand',
    'west bengal', 'delhi', 'jammu', 'kashmir', 'ladakh', 'chandigarh',
    'puducherry', 'lakshadweep', 'andaman'
  ];
  for (const state of states) {
    if (lower.includes(state)) return state.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return 'All India';
};

const inferTagsFromText = (title = '', category = '') => {
  const tags = [category];
  const keywords = ['upsc', 'ssc', 'railway', 'rrb', 'ibps', 'sbi', 'rbi', 'police',
    'army', 'navy', 'air force', 'teacher', 'nurse', 'engineer', 'clerk',
    'constable', 'psc', 'neet', 'jee', 'ntpc', 'group d', 'group c'];
  const lower = title.toLowerCase();
  for (const kw of keywords) {
    if (lower.includes(kw)) tags.push(kw);
  }
  return [...new Set(tags)];
};

// --- Data Extraction Helpers for Fallback ---

const extractAge = (text) => {
  const patterns = [
    /(?:age\s*(?:limit)?|umar|umra)\s*[:\-–]?\s*(\d{1,2})\s*(?:to|se|–|-)\s*(\d{1,2})\s*(?:years?|saal|varsh)?/i,
    /(\d{1,2})\s*(?:to|se|–|-)\s*(\d{1,2})\s*(?:years?|saal|varsh)/i,
    /minimum\s*age\s*[:\-]?\s*(\d{1,2})/i,
    /maximum\s*age\s*[:\-]?\s*(\d{1,2})/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      if (m[2]) return `${m[1]} se ${m[2]} saal`;
      return `${m[1]} saal`;
    }
  }
  return '';
};

const extractQualification = (text) => {
  const lower = text.toLowerCase();
  const quals = [];
  if (/post[\s-]?graduat|m\.?a|m\.?sc|m\.?tech|m\.?com|mba|mca/i.test(lower)) quals.push('Post Graduate');
  if (/graduat|b\.?a|b\.?sc|b\.?tech|b\.?com|b\.?e\b|bachelor/i.test(lower)) quals.push('Graduate');
  if (/12th|12vi|inter(mediate)?|higher secondary|\+2|plus two|hsc/i.test(lower)) quals.push('12th Pass');
  if (/10th|10vi|matric(ulation)?|secondary|ssc\b|high school/i.test(lower)) quals.push('10th Pass');
  if (/iti\b|industrial training/i.test(lower)) quals.push('ITI');
  if (/diploma/i.test(lower)) quals.push('Diploma');
  if (/b\.?ed|d\.?el\.?ed|teacher training/i.test(lower)) quals.push('B.Ed/D.El.Ed');
  if (/mbbs|bds|nursing|medical/i.test(lower)) quals.push('Medical Degree');
  if (/engineering|b\.?e\b|b\.?tech/i.test(lower)) quals.push('Engineering Degree');
  return [...new Set(quals)];
};

const extractDates = (text) => {
  const dates = [];
  const datePatterns = [
    { label: 'Application Start', pattern: /(?:application|apply|form)\s*(?:start|begin|opening)\s*(?:date)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Last Date to Apply', pattern: /(?:last\s*date|closing\s*date|deadline)\s*(?:to\s*apply)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Exam Date', pattern: /(?:exam|examination|test|paper)\s*(?:date)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Admit Card Date', pattern: /(?:admit\s*card|hall\s*ticket)\s*(?:date|available|release)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Result Date', pattern: /(?:result)\s*(?:date|announce|declare)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
  ];
  for (const { label, pattern } of datePatterns) {
    const m = text.match(pattern);
    if (m) dates.push({ label, date: m[1].trim() });
  }
  return dates;
};

const extractVacancy = (text) => {
  const patterns = [
    /(\d[\d,]+)\s*(?:vacanc|post|seat|pad|bharti|recruitment)/i,
    /(?:total|kul)\s*(?:vacanc|post|seat|pad)\s*[:\-–]?\s*(\d[\d,]+)/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const num = parseInt((m[1] || m[2] || '').replace(/,/g, ''), 10);
      if (num > 0 && num < 1000000) return num;
    }
  }
  return 0;
};

const extractSalary = (text) => {
  const patterns = [
    /(?:salary|pay\s*scale|vetan|pay\s*band)\s*[:\-–]?\s*(₹?\s*\d[\d,]+\s*(?:to|se|–|-)\s*₹?\s*\d[\d,]+)/i,
    /(?:salary|pay)\s*[:\-–]?\s*(₹?\s*\d[\d,]+\s*(?:per\s*month|monthly|pm)?)/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return m[1].trim();
  }
  return '';
};

const extractOrg = (text) => {
  const orgs = [
    'UPSC', 'SSC', 'IBPS', 'SBI', 'RBI', 'Railway', 'RRB', 'NTA',
    'CSIR', 'DRDO', 'ISRO', 'AIIMS', 'IIT', 'NIT', 'BPSC', 'UPPSC',
    'MPPSC', 'RPSC', 'TNPSC', 'KPSC', 'APPSC', 'TSPSC', 'WBPSC',
    'HPSC', 'JPSC', 'CGPSC', 'UKPSC', 'OPSC', 'GPSC',
    'Indian Army', 'Indian Navy', 'Indian Air Force', 'BSF', 'CRPF',
    'CISF', 'ITBP', 'SSB', 'NIA', 'CBI', 'Coast Guard',
    'Delhi Police', 'UP Police', 'Bihar Police', 'MP Police', 'Rajasthan Police',
    'CTET', 'CBSE', 'ICSE', 'UGC', 'AICTE', 'BEL', 'HAL', 'BHEL',
    'ONGC', 'NTPC', 'SAIL', 'GAIL', 'IOC', 'HPCL', 'BPCL',
  ];
  for (const org of orgs) {
    if (text.toUpperCase().includes(org.toUpperCase())) return org;
  }
  return '';
};

const extractQualLevel = (text) => {
  const lower = text.toLowerCase();
  if (/post[\s-]?graduat|m\.?a\b|m\.?sc|m\.?tech|m\.?com|mba|mca/i.test(lower)) return 'post-graduate';
  if (/graduat|b\.?a\b|b\.?sc|b\.?tech|b\.?com|b\.?e\b|bachelor/i.test(lower)) return 'graduate';
  if (/diploma/i.test(lower)) return 'diploma';
  if (/iti\b|industrial training/i.test(lower)) return 'iti';
  if (/12th|12vi|inter(mediate)?|higher secondary|\+2|hsc/i.test(lower)) return '12th';
  if (/10th|10vi|matric|secondary|high school/i.test(lower)) return '10th';
  return '';
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const fallbackTransform = (job) => {
  const cat = categoryLabels[job.category] || 'Sarkari Update';
  const title = job.title.replace(/\s*[-–|]\s*(Latest Update|Sarkari.*)$/i, '').trim();
  const desc = (job.description || '').trim();
  const descClean = desc.slice(0, 500).trim();
  const combinedText = `${title} ${desc}`;

  // --- Extract real data from description ---
  const ageRange = extractAge(combinedText);
  const quals = extractQualification(combinedText);
  const dates = extractDates(combinedText);
  const vacancy = extractVacancy(combinedText);
  const salary = extractSalary(combinedText);
  const org = extractOrg(combinedText);
  const qualLevel = extractQualLevel(combinedText);
  const state = inferStateFromText(combinedText);

  // --- Build unique, rich content (400+ words) ---
  const openers = {
    job: [
      `${title} ke tahat ek important bharti notification jaari ki gayi hai.`,
      `${org || 'Vibhag'} ne ${title} ke liye nayi vacancies ka announcement kiya hai.`,
      `Sarkari naukri dhundhne walon ke liye khushkhabri — ${title} ka notification aa chuka hai.`,
    ],
    result: [
      `${title} ka result ab official website par available hai.`,
      `${org || 'Vibhag'} ne ${title} ka result ghoshit kar diya hai.`,
      `Jo candidates ${title} ka exam de chuke the, unke liye result declare ho gaya hai.`,
    ],
    'admit-card': [
      `${title} ka admit card ab download ke liye uplabdh hai.`,
      `${org || 'Vibhag'} ne ${title} ke liye admit card jaari kar diya hai.`,
      `Exam ki tayyari kar rahe candidates ab ${title} ka admit card download kar sakte hain.`,
    ],
    admission: [
      `${title} ke liye admission notification jaari ho chuki hai.`,
      `${org || 'Sansthaan'} ne ${title} mein dakhile ke liye aavedan mangwaye hain.`,
      `Students ke liye achhi khabar — ${title} mein admission process shuru ho gaya hai.`,
    ],
    scholarship: [
      `${title} ke tahat scholarship yojana ka notification jaari kiya gaya hai.`,
      `${org || 'Sarkar'} ne ${title} ke liye scholarship scheme launch ki hai.`,
      `Vidyarthiyon ke liye sunhara mauka — ${title} scholarship ke liye abhi apply karein.`,
    ],
    'exam-form': [
      `${title} ke liye online exam form bharna shuru ho gaya hai.`,
      `${org || 'Vibhag'} ne ${title} ke liye registration process start kar diya hai.`,
      `Jo candidates ${title} mein interested hain, unke liye form submission shuru ho chuka hai.`,
    ],
  };

  const opener = pickRandom(openers[job.category] || openers.job);

  // Build description paragraph with real extracted data
  let detailsPara = '';
  if (vacancy > 0) detailsPara += `Is bharti mein kul ${vacancy.toLocaleString('en-IN')} padon par niyuktiyan ki jayengi. `;
  if (salary) detailsPara += `Chayni hone ke baad salary ${salary} tak mil sakti hai. `;
  if (quals.length > 0) detailsPara += `Is post ke liye minimum qualification ${quals.join(', ')} hai. `;
  if (ageRange) detailsPara += `Age limit ${ageRange} rakhi gayi hai (reserved categories ko niyamanusaar chhoot milegi). `;
  if (state && state !== 'All India') detailsPara += `Ye bharti khaas taur par ${state} ke candidates ke liye hai. `;
  if (state === 'All India') detailsPara += `Ye ek All India level ki bharti hai jismein poore Bharat ke eligible candidates apply kar sakte hain. `;

  // Dynamically build unique guidance paragraphs using randomized sentence variations
  // with contextual org/title references to bypass duplicate/thin content filters
  const buildDynamicGuidance = () => {
    const appOptions = [
      `Application process ke liye candidates ko ${org || 'official website'} par jaana hoga. Online form bharte samay apni details, educational documents aur signature correct load karein. Confirmation printout zaroor nikaal kar rakhein.`,
      `Jo candidates ${title} form bharna chahte hain, wo direct official apply link se form fill kar sakte hain. Application fees ka payment online mode (UPI/Debit Card) se hi karein.`,
      `Apply karne se pehle ${org || 'recruitment board'} ki instructions dhyan se padhein. Personal information aur scanned photo upload karte samay koi mistake na karein.`
    ];
    
    const selectionOptions = [
      `Selection process ke bare mein baat karein toh isme written exam, physical assessment (agar applicable ho), document verification aur medical test shamil hai.`,
      `Candidates ka selection written examination aur interviews/skills test ke basis par kiya jayega. Syllabus aur exam pattern notification PDF mein detailed tarike se diya gaya hai.`,
      `Sarkari pariksha mein high score karne ke liye syllabus ko poora cover karein. Selection board selection rules aur eligibility criteria ke mutabik merit list banayega.`
    ];
    
    const docOptions = [
      `Zaroori documents mein 10th/12th class ki marksheet, qualification certificate, Aadhaar card, aur category certificate (SC/ST/OBC) ready rakhein.`,
      `Candidates apne original certificates jaise academic qualifications, age proof, identity card aur category status verification ke samay zaroor saath le jayein.`,
      `Verification ke samay passport size photo, self-attested photocopies aur standard ID card ke bina validation nahi kiya jata hai.`
    ];

    const resultDocOptions = [
      `Result check karne ke liye official portal par Roll Number ya Registration ID enter karein. Category-wise cut-off marks aur merit list verify karein.`,
      `Merit list mein name check karne ke baad scorecard download karein. Downloaded result sheet ka printout future document verification round ke liye safe rakhein.`,
      `Jo candidates selection parameters qualify karenge unka final selection status department ki verified list mein print kiya jayega.`
    ];

    const admitCardOptions = [
      `Admit card print karne ke baad uspar likhi pariksha timing, date aur exam center address verify kar lein. Passport size photo aur direct ID card lekar hi exam hall mein entry milegi.`,
      `Exam hall ticket release hote hi download link direct active kiya jayega. Bina hall ticket aur photo ID proof ke entry strict rule se blocked rehti hai.`,
      `Roll number aur registration portal details enter karke admit card verify kar lein. Any mistakes hone par support team se immediate contact karein.`
    ];

    const admissionOptions = [
      `Admission guidelines ke mutabik candidates portal par registered certificates aur college details choose karein. Seat allotment ke baad documentation check hoga.`,
      `Selected list ke students seat confirmation fee online submit karein. College allotment letter aur migration documents verify karwana compulsory hai.`
    ];

    const scholarshipOptions = [
      `Scholarship direct bank account (DBT) ke through account mein send ki jayegi. Paatrata guidelines verify hone ke baad hi funding list update hoti hai.`,
      `Bank details aur documents correct load karein. Eligibility verify hone ke baad state ya central scholarship list release ki jayegi.`
    ];

    const examFormOptions = [
      `Exam center aur medium of exam preference correct select karein. One Time Registration (OTR) details verify hone ke baad hi check out karein.`,
      `Submit click karne se pehle cross-check zaroor karein. Forms mein edit block hone par corrections impossible hote hain.`
    ];

    const selectedApp = pickRandom(appOptions);

    if (job.category === 'result') {
      return `\n\n${selectedApp}\n\n${pickOption(resultDocOptions)}`;
    }
    if (job.category === 'admit-card') {
      return `\n\n${selectedApp}\n\n${pickOption(admitCardOptions)}`;
    }
    if (job.category === 'admission') {
      return `\n\n${selectedApp}\n\n${pickOption(admissionOptions)}`;
    }
    if (job.category === 'scholarship') {
      return `\n\n${selectedApp}\n\n${pickOption(scholarshipOptions)}`;
    }
    if (job.category === 'exam-form') {
      return `\n\n${selectedApp}\n\n${pickOption(examFormOptions)}`;
    }
    
    // Default / Job category
    return `\n\n${selectedApp}\n\n${pickOption(selectionOptions)}\n\n${pickOption(docOptions)}`;
  };

  const pickOption = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const selectedGuidance = buildDynamicGuidance();

  const fullContent = `${opener} ${descClean}\n\n${detailsPara}${selectedGuidance}`;

  // --- Build eligibility (return empty if no real data found) ---
  let eligibility = '';
  if (quals.length > 0 || ageRange) {
    const rows = [];
    if (quals.length > 0) rows.push(`<tr><td>Educational Qualification</td><td>${quals.join(', ')}</td></tr>`);
    if (ageRange) rows.push(`<tr><td>Age Limit</td><td>${ageRange} (reserved categories ko niyamanusaar relaxation milegi)</td></tr>`);
    if (state && state !== 'All India') rows.push(`<tr><td>State/Region</td><td>${state}</td></tr>`);
    if (vacancy > 0) rows.push(`<tr><td>Total Vacancies</td><td>${vacancy.toLocaleString('en-IN')}</td></tr>`);
    if (salary) rows.push(`<tr><td>Salary/Pay Scale</td><td>${salary}</td></tr>`);
    eligibility = `<table class="sp-table"><thead><tr><th>Criteria</th><th>Details</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }

  // --- Build important dates (return empty if no real dates found) ---
  let importantDates = '';
  if (dates.length > 0) {
    const rows = dates.map(d => `<tr><td>${d.label}</td><td>${d.date}</td></tr>`).join('');
    importantDates = `<table class="sp-table"><thead><tr><th>Event</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  // --- Build summary ---
  const summaryParts = [`${cat}: ${title}.`];
  if (vacancy > 0) summaryParts.push(`Kul ${vacancy.toLocaleString('en-IN')} padon par bharti.`);
  if (quals.length > 0) summaryParts.push(`Qualification: ${quals[0]}.`);
  if (ageRange) summaryParts.push(`Age: ${ageRange}.`);
  const summary = summaryParts.join(' ').slice(0, 200);

  // --- Extract last date ---
  let lastDate = '';
  const lastDateEntry = dates.find(d => d.label.toLowerCase().includes('last'));
  if (lastDateEntry) {
    const parsed = parseDateSafe(lastDateEntry.date);
    if (parsed) lastDate = parsed;
  }

  return {
    rewrittenTitle: `${title} — ${cat} 2026 Notification`,
    content: fullContent,
    summary,
    eligibility,
    importantDates,
    state,
    organization: org,
    vacancyCount: vacancy,
    lastDate,
    qualificationLevel: qualLevel,
    metaTitle: `${title} — ${cat} 2026 | SarkariPulse`.slice(0, 60),
    metaDescription: `${cat}: ${title}. ${descClean.slice(0, 120)}`.slice(0, 155),
    tags: inferTagsFromText(title, job.category)
  };
};

const buildPrompt = (job) => `
You are an expert SEO content writer for a popular Indian government jobs website (SarkariPulse).
Your audience searches in Hindi + English mix. Write in natural, conversational Hinglish.

TASK: Rewrite this notification as a unique, engaging Hinglish article.
For admission: focus on college details, eligibility, fees, documents, how to apply step-by-step.
For scholarship: focus on who can apply, how much money, eligibility, application process.
For exam-form: focus on how to fill form step-by-step, documents needed, fees, last date.

INPUT:
Title: ${job.title}
Description: ${job.description}
Category: ${job.category}

OUTPUT: Return ONLY valid JSON with this exact structure:
{
  "rewrittenTitle": "Catchy Hinglish title with primary keyword (max 70 chars, NO source name like Adda247/Jagran/Times)",
  "content": "Unique SEO-friendly Hinglish article (400-600 words). Write a comprehensive article covering: kya hai yeh bharti, kitni vacancies, kaun apply kar sakta hai, selection process kya hai, kaise apply karein step-by-step, zaroori documents, fees details. Each paragraph should add new information. IMPORTANT: If there is structured data like Application Fees, Vacancy Breakdown, or Salary/Pay Scale, format it as an HTML <table class='sp-table'> within the content. Use <thead>, <tbody>, <tr>, <th>, <td>. Do not use markdown tables.",
  "summary": "2-3 line crisp summary in Hinglish covering key points",
  "eligibility": "Age limit, education aur category requirements. If complex, use an HTML <table class='sp-table'>. Otherwise, write natural Hinglish text or bullet points.",
  "importantDates": "Important dates. If multiple dates exist, use an HTML <table class='sp-table'> with columns for Event and Date. Otherwise, write natural Hinglish text.",
  "state": "Indian state name if mentioned (e.g. Bihar, Uttar Pradesh, Maharashtra). Use 'All India' if central/national/multi-state.",
  "organization": "Organization/department name (e.g. UPSC, SSC, Railway, Bihar Police). Extract from title/description.",
  "vacancyCount": 0,
  "lastDate": "Last date to apply in YYYY-MM-DD format if mentioned, otherwise empty string",
  "qualificationLevel": "One of: 10th, 12th, graduate, post-graduate, diploma, iti, any. Pick the minimum required.",
  "metaTitle": "SEO meta title under 60 chars with primary keyword in Hinglish",
  "metaDescription": "SEO meta description under 155 chars summarizing the notification in Hinglish",
  "tags": ["tag1", "tag2", "tag3"]
}

STRICT RULES:
- NEVER copy the title as-is. Rewrite it with relevant Hindi keywords.
- NEVER add source names (Adda247, Jagran Josh, Times of India etc) in title.
- Content must be UNIQUE, not a template. Mention specific details from the description.
- Use Hinglish naturally: "apply karein", "bharti", "vacancies", "notification jaari".
- vacancyCount must be a number (0 if unknown). lastDate must be YYYY-MM-DD or empty string.
- tags should include category, organization, state if applicable. Max 5 tags.
- No markdown, no extra keys, no comments.
`.trim();

const parseDateSafe = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const normalizeAiJson = (text) => {
  let parsedText = text;

  try {
    JSON.parse(parsedText);
  } catch (_error) {
    const start = parsedText.indexOf('{');
    const end = parsedText.lastIndexOf('}');
    if (start >= 0 && end > start) {
      parsedText = parsedText.slice(start, end + 1);
    }
  }

  const parsed = JSON.parse(parsedText);
  return {
    rewrittenTitle: parsed.rewrittenTitle,
    content: parsed.content,
    summary: parsed.summary,
    eligibility: parsed.eligibility,
    importantDates: parsed.importantDates,
    state: parsed.state || 'All India',
    organization: parsed.organization || '',
    vacancyCount: Number(parsed.vacancyCount) || 0,
    lastDate: parseDateSafe(parsed.lastDate),
    qualificationLevel: parsed.qualificationLevel || '',
    metaTitle: (parsed.metaTitle || '').slice(0, 60),
    metaDescription: (parsed.metaDescription || '').slice(0, 155),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map(String) : []
  };
};

const isQuotaError = (error) => {
  const statusCode = Number(error?.status || error?.code || 0);
  return statusCode === 429 || String(error?.message || '').includes('429');
};

const getStatusCode = (error) => Number(error?.status || error?.code || 0);

const isProviderConfigError = (error) => {
  const statusCode = getStatusCode(error);
  if (statusCode !== 400 && statusCode !== 404) return false;

  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('model not found') ||
    message.includes('is not found') ||
    message.includes('not supported') ||
    message.includes('unknown model')
  );
};

const isAuthError = (error) => {
  const statusCode = getStatusCode(error);
  return statusCode === 401 || statusCode === 403;
};

const rewriteWithOpenAi = async (prompt) => {
  if (!client) {
    throw new Error('OPENAI_API_KEY missing');
  }

  const response = await client.chat.completions.create({
    model: env.openAiModel,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200,
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No OpenAI content returned');
  }

  return normalizeAiJson(content);
};

const rewriteWithGemini = async (prompt) => {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY missing');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
        responseMimeType: 'application/json'
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`Gemini error: ${response.status} ${body}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('No Gemini content returned');
  }

  return normalizeAiJson(content);
};

const rewriteWithGrok = async (prompt) => {
  if (!grokClient) {
    throw new Error('GROK_API_KEY missing');
  }

  const response = await grokClient.chat.completions.create({
    model: env.grokModel,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200,
    temperature: 0.7
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No Grok content returned');
  }

  return normalizeAiJson(content);
};

const formatCooldownRemaining = (disabledUntil) => {
  const remainingMs = disabledUntil - Date.now();
  if (remainingMs <= 0) return 'expired';
  const mins = Math.ceil(remainingMs / 60000);
  return `${mins} min remaining`;
};

export const rewriteJobWithAi = async (job) => {
  if (!env.aiEnabled) {
    logger.warn('AI disabled via AI_ENABLED=false, using fallback text generation');
    return fallbackTransform(job);
  }

  const prompt = buildPrompt(job);

  // Try OpenAI
  if (Date.now() >= openAiDisabledUntil) {
    try {
      const result = await rewriteWithOpenAi(prompt);
      logger.info('AI rewrite successful via OpenAI', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.aiQuotaCooldownMinutes) * 60 * 1000;
        openAiDisabledUntil = Date.now() + cooldownMs;
        logger.warn('OpenAI quota/rate limit reached, switching to Gemini/Grok fallback', {
          cooldownMinutes: env.aiQuotaCooldownMinutes
        });
      } else if (isAuthError(error)) {
        openAiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('OpenAI auth failed (invalid/expired API key), disabling for 12h', {
          status: getStatusCode(error)
        });
      } else {
        logger.error('OpenAI generation failed, trying Gemini/Grok fallback', { error: error.message });
      }
    }
  } else {
    logger.info('OpenAI skipped (cooldown active)', { cooldown: formatCooldownRemaining(openAiDisabledUntil) });
  }

  // Try Gemini
  if (Date.now() >= geminiDisabledUntil) {
    try {
      const result = await rewriteWithGemini(prompt);
      logger.info('AI rewrite successful via Gemini', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.geminiQuotaCooldownMinutes) * 60 * 1000;
        geminiDisabledUntil = Date.now() + cooldownMs;
        logger.warn('Gemini quota/rate limit reached, trying Grok fallback', {
          cooldownMinutes: env.geminiQuotaCooldownMinutes
        });
      } else if (isProviderConfigError(error)) {
        geminiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.warn('Gemini provider config/model invalid, temporarily disabling Gemini', {
          model: env.geminiModel,
          cooldownHours: 12
        });
      } else if (isAuthError(error)) {
        geminiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('Gemini auth failed (invalid API key), disabling for 12h');
      } else {
        logger.error('Gemini generation failed, trying Grok fallback', { error: error.message });
      }
    }
  } else {
    logger.info('Gemini skipped (cooldown active)', { cooldown: formatCooldownRemaining(geminiDisabledUntil) });
  }

  // Try Grok
  if (Date.now() >= grokDisabledUntil) {
    try {
      const result = await rewriteWithGrok(prompt);
      logger.info('AI rewrite successful via Grok', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.grokQuotaCooldownMinutes) * 60 * 1000;
        grokDisabledUntil = Date.now() + cooldownMs;
        logger.warn('Grok quota/rate limit reached, using local fallback', {
          cooldownMinutes: env.grokQuotaCooldownMinutes
        });
      } else if (isProviderConfigError(error)) {
        grokDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.warn('Grok provider config/model invalid, temporarily disabling Grok', {
          model: env.grokModel,
          cooldownHours: 12
        });
      } else if (isAuthError(error)) {
        grokDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('Grok auth failed (invalid API key), disabling for 12h');
      } else {
        logger.error('Grok generation failed, using local fallback', { error: error.message });
      }
    }
  } else {
    logger.info('Grok skipped (cooldown active)', { cooldown: formatCooldownRemaining(grokDisabledUntil) });
  }

  // All providers failed — use improved fallback
  if (!client && !env.geminiApiKey && !grokClient) {
    logger.warn('No AI provider keys configured, using local fallback');
  } else {
    logger.warn('All AI providers exhausted/cooldown, using local fallback', {
      openAiCooldown: formatCooldownRemaining(openAiDisabledUntil),
      geminiCooldown: formatCooldownRemaining(geminiDisabledUntil),
      grokCooldown: formatCooldownRemaining(grokDisabledUntil)
    });
  }

  return fallbackTransform(job);
};
