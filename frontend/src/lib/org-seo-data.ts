export const ORG_SEO_DATA: Record<string, { label: string; shortName: string; emoji: string; description: string; popularExams: string[]; faq: { question: string; answer: string }[] }> = {
  ssc: {
    label: 'Staff Selection Commission (SSC)',
    shortName: 'SSC',
    emoji: '🏛️',
    description: 'Staff Selection Commission (SSC) conducts major government exams like CGL, CHSL, MTS, CPO, and GD Constable for various Ministries and Departments of the Government of India.',
    popularExams: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD', 'SSC CPO', 'SSC JE'],
    faq: [
      {
        question: 'SSC exams ke liye minimum qualification kya hoti hai?',
        answer: 'SSC alag-alag exams conduct karta hai. SSC MTS aur GD ke liye 10th pass, SSC CHSL ke liye 12th pass, aur SSC CGL ke liye Graduation zaroori hai.'
      },
      {
        question: 'SSC CGL ki salary kitni hoti hai?',
        answer: 'SSC CGL officers ki salary post ke hisaab se vary karti hai. Starting in-hand salary aamtaur par ₹45,000 se lekar ₹85,000 per month tak hoti hai.'
      },
      {
        question: 'SSC ki upcoming vacancy kab aayegi?',
        answer: 'SSC har saal apna Annual Exam Calendar release karta hai. Latest dates aur official notification SarkariPulse par sabse pehle update kiye jaate hain.'
      }
    ]
  },
  upsc: {
    label: 'Union Public Service Commission (UPSC)',
    shortName: 'UPSC',
    emoji: '⭐',
    description: 'Union Public Service Commission (UPSC) is India\'s premier central recruiting agency for Group A officers, including IAS, IPS, IFS, NDA, and CDS.',
    popularExams: ['Civil Services (IAS/IPS)', 'NDA', 'CDS', 'CAPF', 'EPFO'],
    faq: [
      {
        question: 'UPSC Civil Services exam (IAS) ke liye age limit kya hai?',
        answer: 'General category ke liye age limit 21 se 32 saal hai. OBC ko 3 saal aur SC/ST ko 5 saal ka age relaxation milta hai.'
      },
      {
        question: 'Kya 12th pass students UPSC exam de sakte hain?',
        answer: 'Haan, 12th pass students UPSC NDA (National Defence Academy) aur SCRA exam de sakte hain. Lekin IAS/IPS banne ke liye graduation zaroori hai.'
      },
      {
        question: 'UPSC mein kitne attempts milte hain?',
        answer: 'General category ke liye 6 attempts, OBC ke liye 9 attempts, aur SC/ST ke liye unlimited attempts (age limit tak) hote hain.'
      }
    ]
  },
  railway: {
    label: 'Railway Recruitment Board (RRB / RRC)',
    shortName: 'Railway',
    emoji: '🚂',
    description: 'Indian Railways is one of the largest employers in the world. Get latest updates for RRB NTPC, Group D, ALP, and Technician jobs.',
    popularExams: ['RRB NTPC', 'Railway Group D', 'RRB ALP', 'RRB JE', 'RPF Constable/SI'],
    faq: [
      {
        question: 'Railway mein 10th pass ke liye kaunsi job aati hai?',
        answer: '10th pass candidates ke liye Railway mein Group D, RPF Constable aur Track Maintainer ki bhari sankhya mein vacancy aati hai.'
      },
      {
        question: 'RRB NTPC kya hota hai?',
        answer: 'NTPC (Non-Technical Popular Categories) railway ka sabse popular exam hai jisme Station Master, Ticket Clerk, aur Goods Guard ki posts aati hain.'
      },
      {
        question: 'Kya Railway Group D ke liye ITI zaroori hai?',
        answer: 'Kuch specific technical posts ke liye ITI zaroori kar diya gaya hai, par sabhi Group D posts ke liye nahi. Official notification aane par exact details milti hain.'
      }
    ]
  },
  banking: {
    label: 'Banking & Financial Sector (IBPS / SBI / RBI)',
    shortName: 'Banking',
    emoji: '🏦',
    description: 'Latest Banking jobs in public sector banks, RBI, and rural banks. Apply for IBPS PO, SBI Clerk, RBI Assistant, and NABARD Grade A vacancies.',
    popularExams: ['SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'RBI Assistant', 'RRB PO'],
    faq: [
      {
        question: 'Bank PO banne ke liye minimum percentage kya chahiye?',
        answer: 'Aamtaur par Bank PO (IBPS/SBI) ke liye graduation mein koi minimum percentage required nahi hoti, aap bas pass hone chahiye. RBI Grade B ke liye 60% zaroori hota hai.'
      },
      {
        question: 'Bank clerk salary kitni hoti hai?',
        answer: 'Ek bank clerk ki starting in-hand salary ₹30,000 se ₹35,000 ke beech hoti hai, plus baki allowances alag se milte hain.'
      },
      {
        question: 'Kya final year ke students bank exam de sakte hain?',
        answer: 'Haan, SBI PO/Clerk aur IBPS exams final year students bhi de sakte hain, bas unka result notification mein di gayi cut-off date se pehle aa jana chahiye.'
      }
    ]
  },
  defense: {
    label: 'Indian Defense Forces (Army / Navy / Air Force)',
    shortName: 'Defense',
    emoji: '🪖',
    description: 'Join the Indian Armed Forces. Latest jobs for Indian Army Agniveer, Indian Navy, Indian Air Force, CAPF (BSF, CRPF, CISF, ITBP), and Coast Guard.',
    popularExams: ['Army Agniveer', 'Navy MR/SSR', 'Air Force X/Y', 'NDA', 'SSC GD', 'BSF Tradesman'],
    faq: [
      {
        question: 'Agniveer scheme kya hai?',
        answer: 'Agnipath scheme ke tahat Indian Army, Navy aur Air Force mein 4 saal ke liye youth (Agniveers) ko bharti kiya jata hai. Iske baad 25% ko permanent commission milta hai.'
      },
      {
        question: 'Agniveer Army bharti ke liye age limit kya hai?',
        answer: 'Agniveer GD aur baki trades ke liye age limit 17.5 saal se lekar 21 saal tak hoti hai.'
      },
      {
        question: 'Paramilitary (CAPF) mein jobs kaise milti hai?',
        answer: 'BSF, CRPF, CISF jaisi forces mein Constable ki bharti SSC GD ke through hoti hai, jabki Officer level (Assistant Commandant) UPSC CAPF exam ke through hota hai.'
      }
    ]
  },
  police: {
    label: 'State & Central Police Jobs',
    shortName: 'Police',
    emoji: '👮',
    description: 'Latest Police recruitment across all Indian states and UTs. Vacancies for Constable, Head Constable, Sub Inspector (SI), and DSP posts.',
    popularExams: ['UP Police Constable', 'Delhi Police', 'Bihar Police SI', 'Rajasthan Police'],
    faq: [
      {
        question: 'Police Constable banne ke liye height kitni honi chahiye?',
        answer: 'Aamtaur par male candidates ke liye minimum height 168 cm (General/OBC) aur female ke liye 152 cm hoti hai. SC/ST candidates ko chhoot milti hai. (State ke hisab se height alag ho sakti hai).'
      },
      {
        question: 'Kya ek state ka candidate dusre state ki police bharti dekh sakta hai?',
        answer: 'Haan, kaafi states mein "Other State" candidates General category ke under apply kar sakte hain, par iske liye us state ka official notification check karna zaroori hai.'
      },
      {
        question: 'Police Sub Inspector (SI) banne ki kya qualification hai?',
        answer: 'Police SI banne ke liye kisi bhi recognized university se Graduation (BA/BSc/BCom aadi) pass hona anivarya hai.'
      }
    ]
  }
};
