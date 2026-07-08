import React from 'react';
import { SafeHtml } from './SafeHtml';

interface DetailedJobInfoProps {
  job: {
    title: string;
    organization?: string;
    category: string;
    qualificationLevel?: string;
    salary?: string;
    vacancyCount?: number;
    lastDate?: string;
    applyLink?: string;
    state?: string;
  };
}

export const DetailedJobInfo: React.FC<DetailedJobInfoProps> = ({ job }) => {
  // Generate detailed content based on job type
  const generateDetailedContent = () => {
    const sections = [];

    // Section 1: Complete Eligibility Breakdown
    sections.push({
      id: 'detailed-eligibility',
      title: '📋 Complete Eligibility Details',
      content: `
        <div class="space-y-4">
          <h3 class="font-bold text-base">Educational Qualification</h3>
          <p>Minimum qualification: <strong>${job.qualificationLevel || 'As per official notification'}</strong></p>
          <p>Candidates must have completed their ${job.qualificationLevel || 'required'} from a recognized board/university. Degree/certificate ki original copy document verification ke waqt zaroori hogi.</p>
          
          <h3 class="font-bold text-base mt-4">Age Limit</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>General Category:</strong> As per notification (usually 18-35 years)</li>
            <li><strong>OBC Category:</strong> 3 years relaxation</li>
            <li><strong>SC/ST Category:</strong> 5 years relaxation</li>
            <li><strong>PwD Candidates:</strong> 10 years relaxation</li>
            <li><strong>Ex-Servicemen:</strong> As per rules</li>
          </ul>
          <p class="text-xs text-muted mt-2">Note: Age calculation ki cut-off date official notification mein specified hogi. Aur details ke liye notification zaroor padhein.</p>

          <h3 class="font-bold text-base mt-4">Nationality</h3>
          <p>Candidate must be a citizen of India. NRI/foreign nationals specific posts ke liye eligible ho sakte hain (official notification check karein).</p>
        </div>
      `
    });

    // Section 2: Selection Process
    sections.push({
      id: 'selection-process',
      title: '🎯 Selection Process & Exam Pattern',
      content: `
        <div class="space-y-4">
          <p>Selection process typically includes following stages:</p>
          
          <h3 class="font-bold text-base">Stage 1: Written Examination</h3>
          <p>Objective type multiple choice questions (MCQs) based on:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>General Knowledge & Current Affairs</li>
            <li>Reasoning & Mental Ability</li>
            <li>Quantitative Aptitude</li>
            <li>English/Hindi Language</li>
            <li>Subject-specific topics (if applicable)</li>
          </ul>
          
          <h3 class="font-bold text-base mt-4">Stage 2: Physical Test (if applicable)</h3>
          <p>Physical tests police, defence, railway aur similar posts ke liye conduct kiye jaate hain:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Height & Weight measurement</li>
            <li>Chest measurement (for male candidates)</li>
            <li>Running test (usually 1600m or 5km)</li>
            <li>Long jump / High jump</li>
          </ul>

          <h3 class="font-bold text-base mt-4">Stage 3: Interview/Skill Test</h3>
          <p>Qualified candidates ko personality test/interview ke liye bulaya jata hai. Technical posts ke liye skill test bhi ho sakta hai.</p>

          <h3 class="font-bold text-base mt-4">Stage 4: Document Verification</h3>
          <p>Final selection ke baad original documents verification mandatory hai. Incomplete documents ya discrepancy milne par candidature cancel ho sakta hai.</p>

          <p class="text-xs text-muted mt-3"><strong>Note:</strong> Exact selection process official notification mein clearly mentioned hoga. Ye general outline hai jo adhiktar govt jobs mein follow kiya jata hai.</p>
        </div>
      `
    });

    // Section 3: Application Fee
    sections.push({
      id: 'application-fee',
      title: '💰 Application Fee Details',
      content: `
        <div class="space-y-4">
          <h3 class="font-bold text-base">Fee Structure (Typical)</h3>
          <table class="w-full border-collapse border border-stone-300">
            <thead>
              <tr class="bg-stone-100">
                <th class="border border-stone-300 p-2 text-left">Category</th>
                <th class="border border-stone-300 p-2 text-left">Fee Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-stone-300 p-2">General / OBC</td>
                <td class="border border-stone-300 p-2">₹500 - ₹1000 (approx)</td>
              </tr>
              <tr>
                <td class="border border-stone-300 p-2">SC / ST / PwD</td>
                <td class="border border-stone-300 p-2">Exempted / ₹0</td>
              </tr>
              <tr>
                <td class="border border-stone-300 p-2">Female Candidates</td>
                <td class="border border-stone-300 p-2">Exempted (in many cases)</td>
              </tr>
              <tr>
                <td class="border border-stone-300 p-2">Ex-Servicemen</td>
                <td class="border border-stone-300 p-2">Exempted (as per rules)</td>
              </tr>
            </tbody>
          </table>

          <h3 class="font-bold text-base mt-4">Payment Mode</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Online Payment:</strong> Credit Card, Debit Card, Net Banking, UPI</li>
            <li><strong>Challan Payment:</strong> Designated banks (if applicable)</li>
          </ul>

          <p class="text-xs text-muted mt-3"><strong>Important:</strong> Application fee non-refundable hai. Exact fee amount official notification mein check karein.</p>
        </div>
      `
    });

    // Section 4: Important Documents
    sections.push({
      id: 'important-documents',
      title: '📄 Required Documents Checklist',
      content: `
        <div class="space-y-4">
          <p>Application form bharte waqt aur document verification ke time ye documents ready rakhein:</p>
          
          <h3 class="font-bold text-base">Educational Documents</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>10th Marksheet & Certificate (Birth date proof)</li>
            <li>12th Marksheet & Certificate</li>
            <li>Graduation / Post-Graduation Degree & Marksheets</li>
            <li>Professional degree/diploma (if required)</li>
          </ul>

          <h3 class="font-bold text-base mt-4">Identity & Address Proof</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>Aadhaar Card (mandatory for most govt jobs)</li>
            <li>PAN Card</li>
            <li>Voter ID Card</li>
            <li>Domicile Certificate (state jobs ke liye)</li>
            <li>Caste Certificate (SC/ST/OBC candidates)</li>
          </ul>

          <h3 class="font-bold text-base mt-4">Other Documents</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>Passport size photographs (recent, colored)</li>
            <li>Signature specimen</li>
            <li>Experience certificate (if required)</li>
            <li>Disability certificate (PwD candidates)</li>
            <li>EWS certificate (if applicable)</li>
            <li>Ex-servicemen certificate (if applicable)</li>
          </ul>

          <p class="text-xs text-muted mt-3"><strong>Pro Tip:</strong> Saare documents ki self-attested photocopies ready rakhein. Original documents bhi verification ke waqt le jaana zaroori hai.</p>
        </div>
      `
    });

    // Section 5: Common Mistakes to Avoid
    sections.push({
      id: 'common-mistakes',
      title: '⚠️ Common Mistakes to Avoid',
      content: `
        <div class="space-y-3">
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Wrong photo/signature upload:</strong> Photo aur signature ke specifications (size, format, background) official notification ke hisaab se hi upload karein.</li>
            <li><strong>Incorrect details:</strong> Name, Date of Birth, Father's Name bilkul marksheet ke according bharein. Spelling mistakes se application reject ho sakti hai.</li>
            <li><strong>Category certificate missing:</strong> Agar aap reserved category se apply kar rahe hain to valid certificate upload karna mandatory hai.</li>
            <li><strong>Fee payment failure:</strong> Payment successful hone ke baad receipt/transaction ID save kar lein. Dubara payment na karein.</li>
            <li><strong>Late application:</strong> Last date se pehle apply kar dein. Technical issues avoid karne ke liye last day ka wait na karein.</li>
            <li><strong>Incomplete documents:</strong> Document verification mein koi bhi document missing ya invalid hone par candidature cancel ho sakta hai.</li>
            <li><strong>Ignoring notification:</strong> Official notification ko carefully padhna bahut zaroori hai. Har detail important hoti hai.</li>
          </ul>
          <p class="text-xs text-muted mt-3">Ye common galtiyan candidates karte hain. In se bachne ke liye form carefully bharein aur official notification 2-3 baar zaroor padhein.</p>
        </div>
      `
    });

    // Section 6: Preparation Tips
    if (job.category === 'job') {
      sections.push({
        id: 'preparation-tips',
        title: '📚 Exam Preparation Tips',
        content: `
          <div class="space-y-4">
            <h3 class="font-bold text-base">Study Plan & Time Management</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Syllabus ko sections mein divide karein aur daily targets set karein</li>
              <li>Weak areas pe zyada focus karein, lekin strong subjects ko bhi revise karte rahein</li>
              <li>Daily 4-6 hours consistent study important hai</li>
              <li>Weekly mock tests zaroor dein apni preparation check karne ke liye</li>
            </ul>

            <h3 class="font-bold text-base mt-4">Best Books & Resources</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>NCERT books (basics strong karne ke liye)</li>
              <li>Previous year question papers (exam pattern samajhne ke liye)</li>
              <li>Standard reference books (subject-wise)</li>
              <li>Online test series & YouTube channels</li>
            </ul>

            <h3 class="font-bold text-base mt-4">Exam Day Tips</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Admit card aur required documents ka print-out le jaana mat bhulein</li>
              <li>Exam center ka address pehle se check kar lein</li>
              <li>Time se 30-45 minutes pehle reach karein</li>
              <li>Pens, pencils, eraser ready rakhein (if allowed)</li>
              <li>Negative marking hai to guessing avoid karein</li>
            </ul>

            <p class="text-xs text-muted mt-3">Consistent preparation aur smart study strategy se aap zaroor qualify kar sakte hain. All the best! 💪</p>
          </div>
        `
      });
    }

    return sections;
  };

  const sections = generateDetailedContent();

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section 
          key={section.id} 
          className="card !p-5 mobile-content-section" 
          id={section.id}
        >
          <h2 className="text-lg font-black text-ink mb-3">{section.title}</h2>
          <div className="text-sm leading-relaxed text-ink/90">
            <SafeHtml content={section.content} />
          </div>
        </section>
      ))}
    </div>
  );
};
