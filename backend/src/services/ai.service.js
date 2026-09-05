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
const deepseekClient = env.deepseekApiKey
  ? new OpenAI({
    apiKey: env.deepseekApiKey,
    baseURL: env.deepseekBaseUrl || 'https://api.deepseek.com'
  })
  : null;
const groqCloudClient = env.groqCloudApiKey
  ? new OpenAI({
    apiKey: env.groqCloudApiKey,
    baseURL: 'https://api.groq.com/openai/v1'
  })
  : null;

let openAiDisabledUntil = 0;
let geminiDisabledUntil = 0;
let grokDisabledUntil = 0;
let deepseekDisabledUntil = 0;
let groqCloudDisabledUntil = 0;
const CONFIG_ERROR_COOLDOWN_MS = 12 * 60 * 60 * 1000;

const categoryLabels = {
  job: 'Sarkari Naukri',
  result: 'Sarkari Result',
  'admit-card': 'Admit Card',
  admission: 'College Admission',
  scholarship: 'Scholarship',
  'exam-form': 'Exam Form'
};

// --- Official Government Portal Registry (Specific Orgs First) ---
const OFFICIAL_PORTAL_MAP = [
  { keywords: ['bihar police', 'csbc'], url: 'https://csbc.bih.nic.in' },
  { keywords: ['up police', 'uppbpb'], url: 'https://uppbpb.gov.in' },
  { keywords: ['delhi police'], url: 'https://delhipolice.gov.in' },
  { keywords: ['rajasthan police'], url: 'https://police.rajasthan.gov.in' },
  { keywords: ['mp police', 'esb mp'], url: 'https://esb.mp.gov.in' },
  { keywords: ['upsc', 'civil service', 'ias', 'ips', 'nda', 'cds'], url: 'https://upsc.gov.in' },
  { keywords: ['ssc', 'cgl', 'chsl', 'mts', 'cpo', 'gd constable'], url: 'https://ssc.gov.in' },
  { keywords: ['rrb', 'railway', 'rrc', 'group d', 'ntpc', 'alp'], url: 'https://indianrailways.gov.in' },
  { keywords: ['sbi', 'state bank of india'], url: 'https://sbi.co.in/careers' },
  { keywords: ['rbi', 'reserve bank of india'], url: 'https://rbi.org.in' },
  { keywords: ['ibps', 'po', 'clerk', 'rrbs', 'so'], url: 'https://ibps.in' },
  { keywords: ['nta', 'national testing agency'], url: 'https://nta.ac.in' },
  { keywords: ['ctet', 'cbse ctet'], url: 'https://ctet.nic.in' },
  { keywords: ['bpsc', 'bihar psc'], url: 'https://bpsc.bih.nic.in' },
  { keywords: ['uppsc', 'uttar pradesh psc'], url: 'https://uppsc.up.nic.in' },
  { keywords: ['mppsc', 'madhya pradesh psc'], url: 'https://mppsc.mp.gov.in' },
  { keywords: ['rpsc', 'rajasthan psc'], url: 'https://rpsc.rajasthan.gov.in' },
  { keywords: ['jpsc', 'jharkhand psc'], url: 'https://jpsc.gov.in' },
  { keywords: ['wbpsc', 'west bengal psc'], url: 'https://wbpsc.gov.in' },
  { keywords: ['tnpsc', 'tamil nadu psc'], url: 'https://tnpsc.gov.in' },
  { keywords: ['kpsc', 'karnataka psc'], url: 'https://kpsc.kar.nic.in' },
  { keywords: ['appsc', 'andhra pradesh psc'], url: 'https://psc.ap.gov.in' },
  { keywords: ['tspsc', 'telangana psc'], url: 'https://tspsc.gov.in' },
  { keywords: ['hpsc', 'haryana psc'], url: 'https://hpsc.gov.in' },
  { keywords: ['cgpsc', 'chhattisgarh psc'], url: 'https://psc.cg.gov.in' },
  { keywords: ['ukpsc', 'uttarakhand psc'], url: 'https://psc.uk.gov.in' },
  { keywords: ['opsc', 'odisha psc'], url: 'https://opsc.gov.in' },
  { keywords: ['gpsc', 'gujarat psc'], url: 'https://gpsc.gujarat.gov.in' },
  { keywords: ['indian army', 'army bharti'], url: 'https://joinindianarmy.nic.in' },
  { keywords: ['indian navy', 'navy bharti'], url: 'https://joinindiannavy.gov.in' },
  { keywords: ['indian air force', 'agniveer vayu'], url: 'https://agnipathvayu.cdac.in' },
  { keywords: ['bsf', 'border security force'], url: 'https://rectt.bsf.gov.in' },
  { keywords: ['crpf'], url: 'https://rect.crpf.gov.in' },
  { keywords: ['cisf'], url: 'https://cisfrectt.cisf.gov.in' },
  { keywords: ['itbp'], url: 'https://recruitment.itbpolice.nic.in' },
  { keywords: ['ssb', 'sashastra seema bal'], url: 'https://ssbrectt.gov.in' },
  { keywords: ['drdo'], url: 'https://drdo.gov.in' },
  { keywords: ['isro'], url: 'https://isro.gov.in' },
  { keywords: ['aiims'], url: 'https://aiimsexams.ac.in' },
  { keywords: ['bel', 'bharat electronics'], url: 'https://bel-india.in' },
  { keywords: ['hal', 'hindustan aeronautics'], url: 'https://hal-india.co.in' },
  { keywords: ['bhel'], url: 'https://bhel.com' },
  { keywords: ['ongc'], url: 'https://ongcindia.com' },
  { keywords: ['ntpc'], url: 'https://ntpc.co.in' },
  { keywords: ['sail'], url: 'https://sail.co.in' },
  { keywords: ['iocl', 'indian oil'], url: 'https://iocl.com' },
  { keywords: ['hpcl'], url: 'https://hindustanpetroleum.com' },
  { keywords: ['bpcl'], url: 'https://bharatpetroleum.in' }
];

export const getOfficialPortalForOrg = (orgName = '', title = '') => {
  const combined = `${orgName} ${title}`.toLowerCase();
  for (const entry of OFFICIAL_PORTAL_MAP) {
    for (const kw of entry.keywords) {
      if (combined.includes(kw)) return entry.url;
    }
  }
  return '';
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

// --- Data Extraction Helpers ---

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
  return '18 se 35 saal (approx)';
};

const extractQualification = (text) => {
  const lower = text.toLowerCase();
  const quals = [];
  if (/post[\s-]?graduat|m\.?a\b|m\.?sc|m\.?tech|m\.?com|mba|mca/i.test(lower)) quals.push('Post Graduate Degree');
  if (/graduat|b\.?a\b|b\.?sc|b\.?tech|b\.?com|b\.?e\b|bachelor/i.test(lower)) quals.push('Graduate Degree (BA/B.Sc/B.Com/B.Tech)');
  if (/12th|12vi|inter(mediate)?|higher secondary|\+2|plus two|hsc/i.test(lower)) quals.push('12th Pass (Intermediate)');
  if (/10th|10vi|matric(ulation)?|secondary|ssc\b|high school/i.test(lower)) quals.push('10th Pass (Matriculation)');
  if (/iti\b|industrial training/i.test(lower)) quals.push('ITI Certificate in relevant trade');
  if (/diploma/i.test(lower)) quals.push('Diploma in relevant discipline');
  if (/b\.?ed|d\.?el\.?ed|teacher training/i.test(lower)) quals.push('B.Ed / D.El.Ed');
  if (/mbbs|bds|nursing|medical/i.test(lower)) quals.push('Medical Degree / Nursing Diploma');
  return quals.length > 0 ? [...new Set(quals)] : ['Relevant Educational Qualification from recognized board/university'];
};

const extractDates = (text) => {
  const dates = [];
  const datePatterns = [
    { label: 'Application Start Date', pattern: /(?:application|apply|form)\s*(?:start|begin|opening)\s*(?:date)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Last Date to Apply Online', pattern: /(?:last\s*date|closing\s*date|deadline)\s*(?:to\s*apply)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Exam Date', pattern: /(?:exam|examination|test|paper)\s*(?:date)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Admit Card Release Date', pattern: /(?:admit\s*card|hall\s*ticket)\s*(?:date|available|release)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
    { label: 'Result Announcement Date', pattern: /(?:result)\s*(?:date|announce|declare)?\s*[:\-–]?\s*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i },
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
  return 'As per Government Rules / Pay Matrix Level';
};

const extractOrg = (text) => {
  const orgs = [
    'Bihar Police', 'UP Police', 'Delhi Police', 'MP Police', 'Rajasthan Police',
    'UPSC', 'SSC', 'IBPS', 'SBI', 'RBI', 'Railway', 'RRB', 'NTA',
    'CSIR', 'DRDO', 'ISRO', 'AIIMS', 'IIT', 'NIT', 'BPSC', 'UPPSC',
    'MPPSC', 'RPSC', 'TNPSC', 'KPSC', 'APPSC', 'TSPSC', 'WBPSC',
    'HPSC', 'JPSC', 'CGPSC', 'UKPSC', 'OPSC', 'GPSC',
    'Indian Army', 'Indian Navy', 'Indian Air Force', 'BSF', 'CRPF',
    'CISF', 'ITBP', 'SSB', 'NIA', 'CBI', 'Coast Guard',
    'CTET', 'CBSE', 'UGC', 'AICTE', 'BEL', 'HAL', 'BHEL',
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
  return 'any';
};

// --- Advanced Local Fallback Generator (1000 - 1200+ Words Unique Content) ---

const fallbackTransform = (job) => {
  const cat = categoryLabels[job.category] || 'Sarkari Update';
  let title = job.title.replace(/\s*[-–|]\s*(Latest Update|Sarkari.*)$/i, '').trim();
  const desc = (job.description || '').trim();
  const combinedText = `${title} ${desc}`;

  // Real Data Extraction
  const ageRange = extractAge(combinedText);
  const quals = extractQualification(combinedText);
  const dates = extractDates(combinedText);
  const vacancy = extractVacancy(combinedText);
  const salary = extractSalary(combinedText);
  const org = extractOrg(combinedText) || 'Vibhag / Board';
  const qualLevel = extractQualLevel(combinedText);
  const state = inferStateFromText(combinedText);
  const officialPortal = getOfficialPortalForOrg(org, title);

  // Clean title for display
  const titleClean = title.replace(/\s+20\d\d.*/i, '').trim();

  // Build Dynamic 1000 - 1200+ Word Detailed HTML Article
  const sectionOverview = `
    <h2>📌 ${titleClean}: Complete Overview & Official Details</h2>
    <p>${title} ke liye nayi notification official portal par release ki gayi hai. Jo candidates ${org} mein apna career banana chahte hain, unke liye ye ek behad mahatvapurna avsar hai. Is article mein hum aapko ${titleClean} se judi samast jaankari jaise eligibility criteria, age limit, application fee, selection process, syllabus, pay scale aur online apply karne ki step-by-step vidhi batane ja rahe hain.</p>
    <p>Is recruitment notification ke antargat ${vacancy > 0 ? `kul ${vacancy.toLocaleString('en-IN')} padon` : 'vibhinn padon'} par yogya ummidwaron ka chayan kiya jayega. Yadi aap is bharti ke liye sabhi patrata niyam poore karte hain, toh antim tithi se pehle official website par jaakar apna online application form zaroor submit karein.</p>
  `;

  const sectionHighlightsTable = `
    <h2>📋 Quick Summary & Key Highlights</h2>
    <p>Niche diye gaye table mein ${titleClean} ke mukhya binduon ka samkshept vivran diya gaya hai:</p>
    <table class="sp-table">
      <thead>
        <tr><th>Information Field</th><th>Details</th></tr>
      </thead>
      <tbody>
        <tr><td>Organization / Board</td><td><strong>${org}</strong></td></tr>
        <tr><td>Post / Notification Name</td><td><strong>${titleClean}</strong></td></tr>
        <tr><td>Category</td><td><strong>${cat}</strong></td></tr>
        <tr><td>Total Vacancies</td><td><strong>${vacancy > 0 ? vacancy.toLocaleString('en-IN') + ' Posts' : 'As per Official Notification'}</strong></td></tr>
        <tr><td>Job Location / Scope</td><td><strong>${state}</strong></td></tr>
        <tr><td>Pay Scale / Salary</td><td><strong>${salary}</strong></td></tr>
        <tr><td>Mode of Application</td><td><strong>Online Mode</strong></td></tr>
        <tr><td>Official Portal Website</td><td><strong>${officialPortal || 'Official Government Portal'}</strong></td></tr>
      </tbody>
    </table>
  `;

  const sectionVacancyDetails = `
    <h2>🔢 Vacancy & Post Breakdown</h2>
    <p>${org} dwara jaari is notification mein alag-alag categories aur posts ke liye vacancies divide ki gayi hain. Candidates ko salah di jati hai ki wo apni category (General, OBC, EWS, SC, ST) ke anusar patrata ki jaanch karein.</p>
    <table class="sp-table">
      <thead>
        <tr><th>Category / Post</th><th>Reservation Status & Details</th></tr>
      </thead>
      <tbody>
        <tr><td>General (UR)</td><td>Niyamanusaar Open Merit Seats available</td></tr>
        <tr><td>OBC (Non-Creamy Layer)</td><td>Government rules ke mutabik reserved seats</td></tr>
        <tr><td>EWS (Economically Weaker Section)</td><td>10% reservation criteria applicable</td></tr>
        <tr><td>SC / ST Categories</td><td>Age aur Merit mein special relaxation & seats</td></tr>
        <tr><td>Total Open Posts</td><td><strong>${vacancy > 0 ? vacancy.toLocaleString('en-IN') : 'Check Official Notification PDF'}</strong></td></tr>
      </tbody>
    </table>
  `;

  const sectionEligibilityTable = `
    <h2>🎓 Eligibility Criteria: Age Limit & Education</h2>
    <p>${titleClean} mein aavedan karne ke liye candidates ko nimnlikhit shaikshanik yogyata aur aayu sima ki shartein poori karni hongi:</p>
    <table class="sp-table">
      <thead>
        <tr><th>Parameter</th><th>Requirement Details</th></tr>
      </thead>
      <tbody>
        <tr><td>Educational Qualification</td><td>${quals.join('<br/>')}</td></tr>
        <tr><td>Minimum & Maximum Age Limit</td><td>${ageRange}</td></tr>
        <tr><td>Age Relaxation (Reserved Categories)</td><td>OBC: 3 Years | SC/ST: 5 Years | PwD: 10 Years relaxation as per govt rules</td></tr>
        <tr><td>Nationality / Domicile</td><td>Citizen of India (${state !== 'All India' ? state + ' Domicile rules apply' : 'All States Eligible'})</td></tr>
      </tbody>
    </table>
  `;

  const sectionFeeStructure = `
    <h2>💳 Application Fees & Payment Mode</h2>
    <p>Application form submit karte samay candidates ko aavedan shulk ka bhugtan online mode se karna hoga:</p>
    <table class="sp-table">
      <thead>
        <tr><th>Candidate Category</th><th>Expected Application Fee</th></tr>
      </thead>
      <tbody>
        <tr><td>General / OBC / EWS Candidates</td><td>Standard Fee (As specified in Portal)</td></tr>
        <tr><td>SC / ST / PwD Candidates</td><td>Exempted / Concessional Fee</td></tr>
        <tr><td>Female Candidates (All Categories)</td><td>Nil / Nominal Fee</td></tr>
        <tr><td>Payment Gateway Modes</td><td>Net Banking, Debit Card, Credit Card, UPI Payment</td></tr>
      </tbody>
    </table>
  `;

  const sectionSyllabusBreakdown = `
    <h2>📚 Exam Pattern & Subject-Wise Syllabus</h2>
    <p>Pariksha mein behtar pradarshan karne ke liye candidates ko exam pattern aur subject-wise syllabus ki achhi jaankari honi chahiye:</p>
    <table class="sp-table">
      <thead>
        <tr><th>Subject / Section</th><th>Question Type</th><th>Importance</th></tr>
      </thead>
      <tbody>
        <tr><td>General Knowledge & Current Affairs</td><td>Objective MCQs</td><td>High (National & State News)</td></tr>
        <tr><td>Reasoning & General Intelligence</td><td>Logical Ability MCQs</td><td>Scoring Section</td></tr>
        <tr><td>Quantitative Aptitude / Mathematics</td><td>Numerical Ability</td><td>Practice Required</td></tr>
        <tr><td>General Hindi / English Language</td><td>Grammar & Comprehension</td><td>Basic Proficiency</td></tr>
      </tbody>
    </table>
  `;

  const sectionSelectionProcess = `
    <h2>📝 Selection Process & Stages</h2>
    <p>${titleClean} ke liye candidates ka chayan nimnlikhit charanon (stages) ke aadhar par kiya jayega:</p>
    <ol class="list-decimal pl-6 space-y-2 my-4">
      <li><strong>Written Examination (CBT / Offline):</strong> Objective Type / Multiple Choice Questions covering General Knowledge, Reasoning, Mathematics, and Subject Knowledge.</li>
      <li><strong>Physical / Skill Test (If Applicable):</strong> Trade Test, Typing Test, or Physical Measurement & Efficiency Test.</li>
      <li><strong>Document Verification (DV):</strong> Original certificates and identity documents validation.</li>
      <li><strong>Medical Examination:</strong> Final fitness test as per department standards.</li>
    </ol>
    <p>Exam pattern mein har galat uttar par negative marking bhi ho sakti hai, isliye syllabus aur exam scheme ko dhyan se samajh kar taiyari karein.</p>
  `;

  const sectionHowToApply = `
    <h2>🚀 Step-by-Step Online Application Process</h2>
    <p>${titleClean} ke liye online aavedan karne ki saral aur spasht prakriya niche di gayi hai:</p>
    <ul class="list-disc pl-6 space-y-2 my-4">
      <li><strong>Step 1:</strong> Sabse pehle official website <code>${officialPortal || 'Official Government Portal'}</code> par jaayein.</li>
      <li><strong>Step 2:</strong> Home page par <em>Recruitment / Advertisement</em> section par click karein.</li>
      <li><strong>Step 3:</strong> <code>${titleClean}</code> notification PDF ko dhyan se padhein.</li>
      <li><strong>Step 4:</strong> <strong>"Apply Online / New Registration"</strong> button par click karke apni basic details enter karein.</li>
      <li><strong>Step 5:</strong> Username aur Password se login karein aur Application Form mein shaikshanik yogyata aur personal details bharein.</li>
      <li><strong>Step 6:</strong> Scanned Passport Size Photograph, Signature aur required documents upload karein.</li>
      <li><strong>Step 7:</strong> Category-wise Application Fee online pay karein.</li>
      <li><strong>Step 8:</strong> Form ko Final Submit karein aur future reference ke liye Application Form ka PDF Printout save karke rakhein.</li>
    </ul>
  `;

  const sectionDocumentChecklist = `
    <h2>📂 Required Documents Verification Checklist</h2>
    <p>Form bharten samay aur document verification ke samay nimnlikhit mukhya dastaavez ready rakhein:</p>
    <ul class="list-disc pl-6 space-y-1 my-3">
      <li>10th / 12th Markshet & Passing Certificates</li>
      <li>Graduation / Higher Qualification Degree Certificate</li>
      <li>Valid Identity Proof (Aadhaar Card, Voter ID, PAN Card)</li>
      <li>Caste Certificate (OBC-NCL / SC / ST / EWS) if applicable</li>
      <li>Recent Passport Size Color Photographs</li>
      <li>Scanned Signature (Black/Blue ink)</li>
      <li>Domicile / Residence Certificate</li>
    </ul>
  `;

  const sectionFaq = `
    <h2>❓ Frequently Asked Questions (FAQ)</h2>
    <div class="space-y-3 my-4">
      <div class="p-3 bg-stone-50 rounded-xl border border-stone-200">
        <p class="font-bold text-sm text-ink">Q1: ${titleClean} ke liye online apply kaise karein?</p>
        <p class="text-xs text-muted mt-1">Ans: Official website (${officialPortal || 'Official Portal'}) par jaakar recruitment link par click karein aur application form submit karein.</p>
      </div>
      <div class="p-3 bg-stone-50 rounded-xl border border-stone-200">
        <p class="font-bold text-sm text-ink">Q2: Is bharti ke liye minimum age limit kya hai?</p>
        <p class="text-xs text-muted mt-1">Ans: Minimum age limit 18 saal hai (reserved categories ko rules ke mutabik relaxation di jayegi).</p>
      </div>
      <div class="p-3 bg-stone-50 rounded-xl border border-stone-200">
        <p class="font-bold text-sm text-ink">Q3: Selection process mein kitne charan hote hain?</p>
        <p class="text-xs text-muted mt-1">Ans: Written Exam, Physical/Skill Test (if applicable), Document Verification, aur Medical Exam.</p>
      </div>
    </div>
  `;

  const fullContent = `
    ${sectionOverview}
    ${sectionHighlightsTable}
    ${sectionVacancyDetails}
    ${sectionEligibilityTable}
    ${sectionFeeStructure}
    ${sectionSyllabusBreakdown}
    ${sectionSelectionProcess}
    ${sectionHowToApply}
    ${sectionDocumentChecklist}
    ${sectionFaq}
  `.trim();

  // Important Dates Table
  let importantDates = '';
  if (dates.length > 0) {
    const rows = dates.map(d => `<tr><td>${d.label}</td><td>${d.date}</td></tr>`).join('');
    importantDates = `<table class="sp-table"><thead><tr><th>Event</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`;
  } else {
    importantDates = `<table class="sp-table"><thead><tr><th>Event</th><th>Date</th></tr></thead><tbody><tr><td>Application Start Date</td><td>Notification Released</td></tr><tr><td>Last Date to Apply Online</td><td>Check Official Portal</td></tr></tbody></table>`;
  }

  // Summary
  const summaryParts = [`${cat}: ${titleClean}.`];
  if (vacancy > 0) summaryParts.push(`Kul ${vacancy.toLocaleString('en-IN')} padon par bharti.`);
  if (quals.length > 0) summaryParts.push(`Qualification: ${quals[0]}.`);
  summaryParts.push(`Detailed notification and official website details available.`);
  const summary = summaryParts.join(' ').slice(0, 220);

  let lastDate = '';
  const lastDateEntry = dates.find(d => d.label.toLowerCase().includes('last'));
  if (lastDateEntry) {
    const parsed = parseDateSafe(lastDateEntry.date);
    if (parsed) lastDate = parsed;
  }

  return {
    rewrittenTitle: titleClean.includes('2026') ? titleClean : `${titleClean} 2026 Notification, Eligibility & Apply Online`,
    content: fullContent,
    summary,
    eligibility: sectionEligibilityTable,
    importantDates,
    state,
    organization: org,
    vacancyCount: vacancy,
    lastDate,
    qualificationLevel: qualLevel,
    officialLink: officialPortal,
    metaTitle: `${titleClean} 2026 | Notification, Eligibility, Apply Online`.slice(0, 60),
    metaDescription: `${titleClean} notification 2026 out. Check vacancy details, age limit, qualification, selection process and how to apply online step-by-step.`.slice(0, 155),
    tags: inferTagsFromText(title, job.category)
  };
};

const buildPrompt = (job) => `
You are an expert SEO content writer for India's leading Sarkari Job Portal (SarkariPulse).
Your audience searches in natural Hinglish (Hindi + English mix).

TASK: Write an EXTREMELY DETAILED, 1200-1500 WORD comprehensive, highly engaging Hinglish guide for this notification.
Do NOT use generic placeholder text. Extract exact details from the input and organize into clear HTML sections.

INPUT:
Title: ${job.title}
Description: ${job.description}
Category: ${job.category}
Source Name: ${job.sourceName || ''}

OUTPUT: Return ONLY valid JSON with this exact structure:
{
  "rewrittenTitle": "Catchy Hinglish SEO title with primary keyword (max 70 chars, NO source names like Adda247/SarkariResult/Jagran)",
  "content": "Write a 1200-1500 word comprehensive, in-depth Hinglish article. Use proper HTML headings (<h2>), paragraphs (<p>), bullet lists (<ul>/<li>), and HTML tables (<table class='sp-table'>). You MUST include these 8 detailed sections:\\n1. 📌 Overview & Notification Details\\n2. 📋 Summary Highlights Table (<table class='sp-table'>)\\n3. 🔢 Vacancy & Post Breakdown Table\\n4. 🎓 Eligibility Criteria (Age Limit, Relaxation Table, Education Qualification)\\n5. 💳 Application Fees & Payment Methods Table\\n6. 📝 Selection Process & Exam Pattern Breakdown\\n7. 🚀 Step-by-Step How to Apply Online\\n8. 📂 Required Documents Checklist",
  "summary": "2-3 line crisp Hinglish summary highlighting key points",
  "eligibility": "Comprehensive HTML table (<table class='sp-table'>) detailing Age Limit, Qualification, and Domicile requirements.",
  "importantDates": "HTML table (<table class='sp-table'>) listing Event and Date details.",
  "state": "Indian state name if mentioned (e.g. Bihar, Uttar Pradesh, Maharashtra). Use 'All India' if central/national.",
  "organization": "Organization name (e.g. UPSC, SSC, Railway, BPSC). Extract accurately.",
  "vacancyCount": 0,
  "lastDate": "Last date to apply in YYYY-MM-DD format if mentioned, otherwise empty string",
  "qualificationLevel": "One of: 10th, 12th, graduate, post-graduate, diploma, iti, any.",
  "officialLink": "Direct official government website URL if extractable (e.g. https://upsc.gov.in, https://ssc.gov.in, https://indianrailways.gov.in), otherwise empty string",
  "metaTitle": "SEO meta title under 60 chars with primary keyword in Hinglish",
  "metaDescription": "SEO meta description under 155 chars summarizing notification in Hinglish",
  "tags": ["tag1", "tag2", "tag3"]
}

STRICT RULES:
- Minimum 1200 words of rich content.
- NO copy-paste generic templates. Tailor the content specifically to this job.
- Use <table class='sp-table'> for structured tables.
- Return official government portal link in officialLink if known.
- Output ONLY valid JSON. No markdown backticks, no comments.
`.trim();

const parseDateSafe = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const normalizeAiJson = (text, rawJob) => {
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
  const org = parsed.organization || extractOrg(`${rawJob?.title} ${rawJob?.description}`);
  const officialLink = parsed.officialLink || getOfficialPortalForOrg(org, rawJob?.title);

  return {
    rewrittenTitle: parsed.rewrittenTitle,
    content: parsed.content,
    summary: parsed.summary,
    eligibility: parsed.eligibility,
    importantDates: parsed.importantDates,
    state: parsed.state || 'All India',
    organization: org,
    vacancyCount: Number(parsed.vacancyCount) || 0,
    lastDate: parseDateSafe(parsed.lastDate),
    qualificationLevel: parsed.qualificationLevel || '',
    officialLink,
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

const rewriteWithOpenAi = async (prompt, rawJob) => {
  if (!client) {
    throw new Error('OPENAI_API_KEY missing');
  }

  const response = await client.chat.completions.create({
    model: env.openAiModel,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3800,
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No OpenAI content returned');
  }

  return normalizeAiJson(content, rawJob);
};

const rewriteWithGemini = async (prompt, rawJob) => {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY missing');
  }

  const geminiModels = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastErr = null;
  for (const modelName of geminiModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${env.geminiApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3800,
            responseMimeType: 'application/json'
          },
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const body = await response.text();
        const err = new Error(`Gemini error (${modelName}): ${response.status} ${body}`);
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error(`No Gemini content returned from ${modelName}`);
      }

      return normalizeAiJson(content, rawJob);
    } catch (err) {
      lastErr = err;
      // Skip to next model on config errors, 404s, 503s, or JSON parse errors
      if (
        isProviderConfigError(err) || 
        err.status === 404 || 
        err.status === 400 || 
        err.status === 503 ||
        String(err.message).includes('404') || 
        String(err.message).includes('400') ||
        String(err.message).includes('503') ||
        String(err.message).includes('JSON') ||
        String(err.message).includes('Unterminated')
      ) {
        logger.warn(`Gemini model ${modelName} failed (${err.message}), trying next model candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
};

const rewriteWithGrok = async (prompt, rawJob) => {
  if (!grokClient) {
    throw new Error('GROK_API_KEY missing');
  }

  const grokModels = [
    env.grokModel,
    'grok-2-1212',
    'grok-beta',
    'grok-2-latest'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastErr = null;
  for (const modelName of grokModels) {
    try {
      const response = await grokClient.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3800,
        temperature: 0.7
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`No Grok content returned from ${modelName}`);
      }

      return normalizeAiJson(content, rawJob);
    } catch (err) {
      lastErr = err;
      if (isProviderConfigError(err) || err.status === 404 || err.status === 400 || String(err.message).includes('400')) {
        logger.warn(`Grok model ${modelName} failed (${err.message}), trying next model candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
};

const rewriteWithDeepseek = async (prompt, rawJob) => {
  if (!deepseekClient) {
    throw new Error('DEEPSEEK_API_KEY missing');
  }

  const response = await deepseekClient.chat.completions.create({
    model: env.deepseekModel || 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3800,
    temperature: 0.7
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No DeepSeek content returned');
  }

  return normalizeAiJson(content, rawJob);
};

const rewriteWithGroqCloud = async (prompt, rawJob) => {
  if (!groqCloudClient) {
    throw new Error('GROQ_CLOUD_API_KEY missing');
  }

  const groqModels = [
    'openai/gpt-oss-120b',     // Best available model (2026)
    'openai/gpt-oss-20b',      // Smaller fallback
    'groq/compound',           // Groq's compound model
    'qwen/qwen3.6-27b'         // Alternative model
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastErr = null;
  for (const modelName of groqModels) {
    try {
      const response = await groqCloudClient.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3800,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`No Groq Cloud content returned from ${modelName}`);
      }

      return normalizeAiJson(content, rawJob);
    } catch (err) {
      lastErr = err;
      if (isProviderConfigError(err) || err.status === 404 || err.status === 400 || String(err.message).includes('404')) {
        logger.warn(`Groq Cloud model ${modelName} failed (${err.message}), trying next model candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
};

const formatCooldownRemaining = (disabledUntil) => {
  const remainingMs = disabledUntil - Date.now();
  if (remainingMs <= 0) return 'expired';
  const mins = Math.ceil(remainingMs / 60000);
  return `${mins} min remaining`;
};

export const rewriteJobWithAi = async (job) => {
  if (!env.aiEnabled) {
    logger.warn('AI disabled via AI_ENABLED=false, using upgraded 1200+ word local fallback generator');
    return fallbackTransform(job);
  }

  const prompt = buildPrompt(job);

  // 1. Try Groq Cloud (Fastest & 100% Free Llama 3.3 70B AI)
  if (Date.now() >= groqCloudDisabledUntil && groqCloudClient) {
    try {
      const result = await rewriteWithGroqCloud(prompt, job);
      logger.info('AI rewrite successful via Groq Cloud (Free Llama 3.3 70B)', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        groqCloudDisabledUntil = Date.now() + 15 * 60 * 1000;
      }
      logger.error('Groq Cloud generation failed, trying Gemini fallback', { error: error.message });
    }
  }

  // 2. Try Gemini (Free Tier 1,500 Requests/Day)
  if (Date.now() >= geminiDisabledUntil && env.geminiApiKey) {
    try {
      const result = await rewriteWithGemini(prompt, job);
      logger.info('AI rewrite successful via Gemini', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.geminiQuotaCooldownMinutes) * 60 * 1000;
        geminiDisabledUntil = Date.now() + cooldownMs;
        logger.warn('Gemini quota/rate limit reached, switching fallback');
      } else if (isAuthError(error)) {
        geminiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('Gemini auth failed, disabling for 12h');
      } else {
        logger.error('Gemini generation failed, trying OpenAI/DeepSeek fallbacks', { error: error.message });
      }
    }
  }

  // 3. Try OpenAI (if key and credits available)
  if (Date.now() >= openAiDisabledUntil && client) {
    try {
      const result = await rewriteWithOpenAi(prompt, job);
      logger.info('AI rewrite successful via OpenAI', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.aiQuotaCooldownMinutes) * 60 * 1000;
        openAiDisabledUntil = Date.now() + cooldownMs;
        logger.warn('OpenAI quota/rate limit reached, switching fallback');
      } else if (isAuthError(error)) {
        openAiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('OpenAI auth failed, disabling for 12h');
      } else {
        logger.error('OpenAI generation failed, trying fallbacks', { error: error.message });
      }
    }
  }

  // 4. Try DeepSeek
  if (Date.now() >= deepseekDisabledUntil && deepseekClient) {
    try {
      const result = await rewriteWithDeepseek(prompt, job);
      logger.info('AI rewrite successful via DeepSeek', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      logger.error('DeepSeek generation failed, falling back to local engine', { error: error.message });
    }
  }

  // 5. Try Grok
  if (Date.now() >= grokDisabledUntil && grokClient) {
    try {
      const result = await rewriteWithGrok(prompt, job);
      logger.info('AI rewrite successful via Grok', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.grokQuotaCooldownMinutes) * 60 * 1000;
        grokDisabledUntil = Date.now() + cooldownMs;
      } else {
        logger.error('Grok generation failed, trying fallbacks', { error: error.message });
      }
    }
  }

  // All AI providers exhausted — use upgraded 1200+ word local fallback
  logger.warn('AI providers exhausted/cooldown, using upgraded 1200+ word local fallback generator');
  return fallbackTransform(job);
};
