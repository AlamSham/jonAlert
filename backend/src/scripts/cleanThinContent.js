import { validateEnv } from '../config/env.js';
import { connectDb } from '../config/db.js';
import { Job } from '../models/Job.js';

// Strict regex patterns for non-job / news content (using word boundaries \b to avoid matching Hinglish words like "aapke", "first", etc.)
const IRRELEVANT_PATTERNS = [
  // Politics
  /\b(bjp|congress|lok sabha debate|rajya sabha debate|political crisis|political rally|election result|voting percentage)\b/i,
  // Entertainment & Sports
  /\b(cricket|bollywood|movie review|box office|ipl 2024|ipl 2025|ipl 2026|t20 world cup|oscar awards|celebrity news)\b/i,
  // Natural Disasters & Weather
  /\b(heatwave warning|earthquake hits|cyclone alert|tsunami warning|landslide in|flood situation)\b/i,
  // Crime & Accidents
  /\b(murder case|fatal accident|kidnapping case|rape case|scam alert|cbi arrest|police arrest|controversy breaks)\b/i,
  // Financial Market
  /\b(stock market crash|sensex falls|nifty today|cryptocurrency news|bitcoin price|real estate market)\b/i,
  // Scraped News Headlines & Protests
  /\b(fact-finding probe|public hearing|press conference held|agrees to probe|demands probe|protest marches|farmers protest|strike updates|court hearing)\b/i,
];

// Common news outlet domain patterns found in scraped titles
const NEWS_SOURCE_PATTERNS = [
  /\s*[-–|]\s*(times of india|hindustan times|ndtv|india today|the hindu|economic times)/i,
  /\s*[-–|]\s*(ommcom news|shillongtoday|borderlens|sakshi education|indianmast)/i,
  /\s*[-–|]\s*(telugupeople|careers360|jagran josh|amar ujala|dainik bhaskar)/i,
  /\s*[-–|]\s*(firstpost|republic|wion|mint|moneycontrol|livemint)/i,
  /\s*[-–|]\s*[\w]+\.(com|in|co\.in|org|net)\s*(20\d\d.*)?$/i, // Any "- website.com" pattern at end of title
];

// Job-relevant signal keywords — if title has NONE of these, likely not a job notification
const JOB_SIGNAL_KEYWORDS = [
  'recruitment', 'bharti', 'vacancy', 'vacancies', 'notification',
  'admit card', 'hall ticket', 'result', 'cut off', 'merit list',
  'application', 'apply', 'registration', 'form', 'eligibility',
  'syllabus', 'exam date', 'answer key', 'scorecard', 'counselling',
  'admission', 'scholarship', 'fellowship', 'stipend', 'internship',
  'walk-in', 'interview', 'selection', 'appointment', 'joining',
  'post', 'grade', 'level', 'pay scale', 'salary',
  'sarkari', 'govt', 'government', 'naukri',
  'upsc', 'ssc', 'rrb', 'railway', 'ibps', 'nta', 'police',
  'constable', 'sub inspector', 'clerk', 'peon', 'teacher',
  'engineer', 'nurse', 'doctor', 'professor', 'lecturer',
  'army', 'navy', 'air force', 'bsf', 'crpf', 'cisf', 'itbp',
  'agniveer', 'apprentice', 'trainee',
  'board exam', 'supplementary', 'compartment', 'revaluation',
  'iti', 'polytechnic', 'b.ed', 'neet', 'jee', 'gate', 'cat'
];

function isThinNewsContent(job) {
  const title = (job.title || '').trim();
  const summary = (job.summary || '').trim();
  const content = (job.content || '').trim();
  const combined = `${title} ${summary} ${content}`;

  // 1. Too short title
  if (title.length < 20) {
    return { isThin: true, reason: 'Title too short (<20 chars)' };
  }

  // 2. Irrelevant patterns check (strict regex)
  for (const pattern of IRRELEVANT_PATTERNS) {
    if (pattern.test(combined)) {
      return { isThin: true, reason: `Matches irrelevant pattern: ${pattern}` };
    }
  }

  // 3. News source pattern in title (e.g. "- shillongtoday.com")
  for (const pattern of NEWS_SOURCE_PATTERNS) {
    if (pattern.test(title)) {
      return { isThin: true, reason: `Matches news source pattern: ${pattern}` };
    }
  }

  // 4. Missing job signal keywords in title
  const titleLower = title.toLowerCase();
  const hasJobSignal = JOB_SIGNAL_KEYWORDS.some(kw => titleLower.includes(kw));
  if (!hasJobSignal) {
    return { isThin: true, reason: 'Zero job signal keywords in title' };
  }

  return { isThin: false };
}

const run = async () => {
  const shouldDelete = process.argv.includes('--delete');
  
  validateEnv();
  await connectDb();

  console.log('🔍 Scanning database for thin news content...');
  const allJobs = await Job.find({}).lean();
  console.log(`Total jobs in database: ${allJobs.length}`);

  const toRemove = [];

  for (const job of allJobs) {
    const check = isThinNewsContent(job);
    if (check.isThin) {
      toRemove.push({
        id: job._id,
        slug: job.slug,
        title: job.title,
        reason: check.reason
      });
    }
  }

  console.log(`\nFound ${toRemove.length} thin/news items out of ${allJobs.length} total jobs.\n`);

  if (toRemove.length > 0) {
    console.log('--- List of items marked for removal ---');
    toRemove.forEach((item, idx) => {
      console.log(`${idx + 1}. [${item.reason}] ${item.title}`);
    });
    console.log('----------------------------------------\n');

    if (shouldDelete) {
      console.log('🗑️  Deleting marked items from database...');
      const idsToDelete = toRemove.map(i => i.id);
      const deleteResult = await Job.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`✅ Successfully deleted ${deleteResult.deletedCount} thin/news jobs from database!`);
    } else {
      console.log('ℹ️ DRY RUN ONLY — No items were deleted.');
      console.log('To execute actual deletion, run: node src/scripts/cleanThinContent.js --delete');
    }
  } else {
    console.log('🎉 No thin/news items found in database!');
  }

  process.exit(0);
};

run().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
