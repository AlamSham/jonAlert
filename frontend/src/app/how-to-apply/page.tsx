import { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Sarkari Naukri Online Form Kaise Bharein — Step-by-Step Guide | SarkariPulse',
  description: 'Online application form bharte samay hone wali galtiyon se bachein. Jaaniye documents size, registration process, aur online payment tips Hinglish mein.',
  alternates: { canonical: '/how-to-apply' },
};

export default function HowToApplyPage() {
  const breadcrumbs = [
    { label: 'How to Apply Guide', href: '/how-to-apply' }
  ];

  const faqItems = [
    {
      question: "Online form bhare bina offline aavedan kiya ja sakta hai?",
      answer: "Nahi, aajkal lagbhag sabhi sarkari bhartiyon (SSC, Bank, Railway, State Commission) ka application process 100% online ho chuka hai. Offline form sirf unhi cases mein accept hote hain jahan official notification mein specify kiya gaya ho."
    },
    {
      question: "Photo aur Signature ka size kaise reduce karein?",
      answer: "Aap online free tools jaise 'CompressJPEG' ya 'ReduceImages' ka use karke photo aur signature ka size (KB mein) requirement ke anusar fit kar sakte hain. Paint app se resize karna bhi aasan option hai."
    },
    {
      question: "Form submit hone ke bad correction window khulti hai?",
      answer: "Kuch commissions jaise SSC aur State PSCs form closed hone ke baad correction window open karte hain (fees ke saath). Lekin kai exams mein correction ka mauka nahi milta. Isliye submit karne se pehle cross-check zaroor karein."
    },
    {
      question: "Payment debit ho gayi par status failed dikha raha hai, kya karein?",
      answer: "Ghabrayein nahi. Aamtaur par bank server issue ki wajah se payment confirm hone mein 24-48 ghante ka samay lagta hai. Dobara payment karne se pehle 48 ghante wait karein aur transaction status check karte rahein."
    }
  ];

  return (
    <div className="container-wrap py-12 animate-fade-in max-w-4xl">
      <Breadcrumb items={breadcrumbs} />

      <header className="mb-10 text-center sm:text-left mt-4">
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
          🚀 Sarkari Naukri Online Form Kaise Bharein: Step-by-Step Guide
        </h1>
        <p className="mt-3 text-muted text-sm leading-relaxed max-w-3xl">
          Sarkari naukri ki taiyari jitni zaroori hai, utna hi zaroori hai online application form ko bina kisi galti ke sahi-sahi bharna. Har saal lakho students sirf form bharte samay ki gayi choti galtiyon ki wajah se reject ho jaate hain. Is guide mein hum step-by-step samjhenge ki online form kaise bharein.
        </p>
      </header>

      <div className="space-y-10 text-sm leading-relaxed text-ink/85">
        {/* Section 1: Pre-requisites */}
        <section className="card !p-6 md:!p-8">
          <h2 className="text-lg font-black text-ink mb-4 flex items-center gap-2">
            📂 Form Bharne Se Pehle Kya Ready Rakhein?
          </h2>
          <p className="mb-4">
            Online form open karne se pehle niche diye gaye sabhi documents ko scan karke apne computer/mobile folder mein save kar lein:
          </p>
          <table className="sp-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Standard Format / Size</th>
                <th>Important Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Passport Size Photo</td>
                <td>JPG/JPEG format (20KB - 50KB)</td>
                <td>Background white/light ho. Goggles/Cap na pehne ho. Photo recent honi chahiye.</td>
              </tr>
              <tr>
                <td>Signature (Hastakshar)</td>
                <td>JPG/JPEG format (10KB - 20KB)</td>
                <td>White paper par black ink pen se clear signature karein. Capital letters mein na ho.</td>
              </tr>
              <tr>
                <td>10th/Matric Marksheet</td>
                <td>PDF/JPG format (100KB - 300KB)</td>
                <td>Name, Father's name aur Date of Birth (DOB) ki verification isi se hoti hai.</td>
              </tr>
              <tr>
                <td>Caste / Category Certificate</td>
                <td>PDF format (Under 500KB)</td>
                <td>OBC-NCL aur EWS certificates current financial year ke valid hone chahiye.</td>
              </tr>
              <tr>
                <td>Aadhaar Card / Govt ID</td>
                <td>Both sides scan (PDF/JPG)</td>
                <td>Identity aur address proof ke roop mein zaroori hota hai.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section 2: Step-by-Step Guide */}
        <section className="card !p-6 md:!p-8">
          <h2 className="text-lg font-black text-ink mb-6 flex items-center gap-2">
            📝 Online Apply Karne Ka Step-by-Step Process
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shrink-0 mt-0.5">1</span>
              <div>
                <h3 className="font-bold text-ink text-sm">Official Notification Dhyan Se Padhein</h3>
                <p className="text-muted mt-1">
                  SarkariPulse portal par notification page se PDF direct download karein. Age limit, Educational qualification, aur Eligibility check karein taaki baad mein disappointment na ho.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shrink-0 mt-0.5">2</span>
              <div>
                <h3 className="font-bold text-ink text-sm">One-Time Registration (OTR) / Sign Up</h3>
                <p className="text-muted mt-1">
                  Pehli baar apply kar rahe hain toh official website par registration option select karein. Apna active email ID aur mobile number register karein. Registration number aur Password ko apne paas safe note kar lein.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shrink-0 mt-0.5">3</span>
              <div>
                <h3 className="font-bold text-ink text-sm">Application Details Fill Karein</h3>
                <p className="text-muted mt-1">
                  Login karke "Apply Online" par click karein. Apni Personal details, Academic details, State quota preference, aur Exam center selection details carefully bharein.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shrink-0 mt-0.5">4</span>
              <div>
                <h3 className="font-bold text-ink text-sm">Documents, Photo aur Sign Upload Karein</h3>
                <p className="text-muted mt-1">
                  Pre-sized photo aur signature scan files ko upload box mein select karein. Agar documents pdf structure mein mange gaye hain, toh unhe correct format mein convert karke upload karein.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shrink-0 mt-0.5">5</span>
              <div>
                <h3 className="font-bold text-ink text-sm">Preview Aur Cross-Check</h3>
                <p className="text-muted mt-1">
                  Final submit button dabaane se pehle **Preview Page** ko achhe se check karein. Ek-ek spelling (Name, Mother/Father Name, Date of Birth, Class 10 roll number) matching verify karein.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shrink-0 mt-0.5">6</span>
              <div>
                <h3 className="font-bold text-ink text-sm">Online Application Fee Payment</h3>
                <p className="text-muted mt-1">
                  Category rules ke matching agar fee payment lagta hai, toh Net Banking, Debit/Credit Card, ya UPI ke zariye online pay karein. Receipt download zaroor karein.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Common Mistakes */}
        <section className="card !p-6 md:!p-8 border-l-4 border-l-red-500">
          <h2 className="text-lg font-black text-ink mb-4 flex items-center gap-2">
            ⚠️ Form Reject Hone Ki Sabse Badi Wajah (Galtiyan)
          </h2>
          <ul className="list-disc list-inside space-y-2.5 ml-2">
            <li><strong>Wrong Category Claim:</strong> Agar General/UR candidate galati se OBC/EWS claim kar deta hai aur certification verify nahi hota, toh candidature sidhe cancel ho jata hai.</li>
            <li><strong>Blurry Photo / Signature:</strong> Agar photo pixelated ya signature clear nahi hai toh machine rejection ho jata hai.</li>
            <li><strong>Cut-off Date:</strong> Qualifications/degree crucial date se pehle complete nahi hoti aur candidates form apply kar dete hain.</li>
            <li><strong>Non-Payment:</strong> Form submit kar dete hain par payment incomplete chhod dete hain, jisse final confirmation status failed ho jata hai.</li>
          </ul>
        </section>

        {/* FAQ Section */}
        <div className="mt-6">
          <FAQ 
            items={faqItems}
            title="🤔 Frequently Asked Questions (FAQ) — Online Apply"
          />
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 justify-center sm:justify-start">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark"
        >
          📚 Browse All Guides
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-300 px-6 py-3 text-sm font-bold text-ink transition hover:bg-stone-50"
        >
          🏠 Return to Homepage
        </Link>
      </div>
    </div>
  );
}
