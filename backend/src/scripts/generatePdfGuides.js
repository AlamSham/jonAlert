import fs from 'fs';
import path from 'path';

// Complete Guides Data with Backlinks
const pdfGuides = [
  {
    title: '10th Pass Best Sarkari Jobs 2026 Guide',
    filename: '10th_Pass_Sarkari_Jobs_2026_Guide_SarkariPulse.html',
    category: 'Job Alert & Career Guide',
    slug: '10th-pass-sarkari-jobs-guide',
    targetUrl: 'https://sarkaripulse.net/guides/10th-pass-sarkari-jobs-guide',
    content: `
      <h2>1. Staff Selection Commission (SSC MTS & GD Constable)</h2>
      <p>SSC har saal 10th pass candidates ke liye national level par do badi parikshayein aayojit karta hai: SSC MTS (Multi-Tasking Staff) aur SSC GD Constable (BSF, CISF, CRPF, SSB, ITBP). Initial salary range <strong>₹25,000 se ₹30,000/month</strong> hoti hai.</p>
      
      <h2>2. Indian Post Office (Gramin Dak Sevak - GDS)</h2>
      <p>Department of Posts dwara har saal 30,000+ GDS, BPM aur ABPM vacancies nikalati hain. Is bharti ka sabse bada benefit ye hai ki <strong>koi exam nahi hota</strong>, selection purely 10th class de percentage par hota hai.</p>

      <h2>3. Indian Railways (RRC Group D Level 1)</h2>
      <p>Railways 10th pass candidates ke liye sabse bada employer hai. Track Maintainer Grade IV, Assistant Pointsman, aur helper posts par direct matriculate candidates apply kar sakte hain.</p>
    `
  },
  {
    title: 'SSC CGL Complete Preparation & Syllabus Strategy Guide 2026',
    filename: 'SSC_CGL_Preparation_Strategy_Guide_SarkariPulse.html',
    category: 'Exam Preparation',
    slug: 'ssc-cgl-preparation-guide',
    targetUrl: 'https://sarkaripulse.net/guides/ssc-cgl-preparation-guide',
    content: `
      <h2>1. SSC CGL Tier 1 & Tier 2 Exam Pattern</h2>
      <p>SSC CGL exam CBT mode mein hota hai. Tier 1 qualifying hota hai aur Tier 2 ke 450 marks par final merit list banti hai. Reasoning, Maths, English, GK aur Computer subjects important hote hain.</p>

      <h2>2. Subject-wise Preparation Tips</h2>
      <p>Maths ke liye daily calculation speed aur formulas revise karein. English grammar rules aur vocabulary ke liye daily newspapers read karein. Reasoning daily practice se scoring hoti hai.</p>
    `
  },
  {
    title: 'UPSC Civil Services Exam Pattern & Syllabus Guide 2026',
    filename: 'UPSC_Civil_Services_Exam_Pattern_Guide_SarkariPulse.html',
    category: 'Civil Services Guide',
    slug: 'upsc-exam-pattern-guide',
    targetUrl: 'https://sarkaripulse.net/guides/upsc-exam-pattern-guide',
    content: `
      <h2>1. Stage 1: Preliminary Exam (GS Paper 1 & CSAT)</h2>
      <p>General Studies Paper 1 (200 marks) se Prelims cutoff decide hoti hai. CSAT (Paper 2) strictly qualifying hota hai jisme 33% (66 marks) laana compulsory hai.</p>

      <h2>2. Stage 2: Mains Descriptive Exam (1750 Marks)</h2>
      <p>Mains mein 9 papers hote hain: Essay (250), GS 1 to 4 (1000 marks), Optional Subject (500 marks), aur 2 qualifying language papers.</p>
    `
  },
  {
    title: 'Sarkari Job Document Verification (DV) Checklist Guide 2026',
    filename: 'Sarkari_Job_Document_Verification_Checklist_SarkariPulse.html',
    category: 'Document Checklist',
    slug: 'sarkari-job-document-verification-guide',
    targetUrl: 'https://sarkaripulse.net/guides/sarkari-job-document-verification-guide',
    content: `
      <h2>1. Universal DV Checklist</h2>
      <p>10th/12th Marksheets, Graduation Degree, Central OBC-NCL/EWS Certificate, Aadhaar Card, Passport Photos, aur Domicile Certificate original aur photocopies ready rakhein.</p>

      <h2>2. Name & DOB Mismatch Solution</h2>
      <p>Agar name spelling mismatch ho, toh First Class Magistrate dwara notarized Affidavit banwa lein. Ye rejection se bachata hai.</p>
    `
  }
];

function generatePrintablePdfHtml(guide) {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${guide.title} — SarkariPulse</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: 900; color: #2563eb; }
    .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
    h1 { font-size: 22px; color: #0f172a; margin-top: 0; }
    h2 { font-size: 16px; color: #1e40af; border-left: 4px solid #2563eb; padding-left: 10px; margin-top: 25px; }
    p { font-size: 13px; color: #334155; }
    .backlink-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; margin-top: 30px; text-align: center; }
    .backlink-box a { color: #1d4ed8; font-weight: bold; text-decoration: underline; font-size: 14px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🔥 SarkariPulse</div>
    <div class="subtitle">Latest Sarkari Naukri, Admit Card, Result & Study Guides</div>
  </div>

  <h1>${guide.title}</h1>
  <p><em>Category: ${guide.category} | Verified Editorial Resource</em></p>

  ${guide.content}

  <div class="backlink-box">
    <p><strong>📖 Full In-Depth Guide & Latest Live Updates:</strong></p>
    <a href="${guide.targetUrl}" target="_blank">${guide.targetUrl}</a>
    <p style="font-size: 11px; color: #64748b; margin-top: 5px;">Visit SarkariPulse for daily real-time recruitment notifications, official PDF downloads, and online application links.</p>
  </div>

  <div class="footer">
    <p>© 2026 SarkariPulse (https://sarkaripulse.net). All Rights Reserved. Free Educational Distribution.</p>
  </div>
</body>
</html>`;
}

function runPdfGenerator() {
  const outputDir = path.join(process.cwd(), 'pdf_backlink_guides');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating Printable PDF/HTML Backlink Guides...\n');

  pdfGuides.forEach(guide => {
    const htmlContent = generatePrintablePdfHtml(guide);
    const filePath = path.join(outputDir, guide.filename);
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`✅ Created Backlink Guide Document: ${guide.filename}`);
  });

  console.log(`\n🎉 All ${pdfGuides.length} PDF Backlink Guides successfully generated in directory: ${outputDir}`);
}

runPdfGenerator();
