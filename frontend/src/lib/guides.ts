export interface Guide {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  date: string;
  readTime: string;
  icon: string;
  tags: string[];
  content: string;
}

export const guides: Guide[] = [
  {
    slug: 'ssc-cgl-preparation-guide',
    title: 'SSC CGL Exam Preparation: Tips, Syllabus aur Strategy Ki Poori Jankari',
    description: 'SSC CGL exam crack karne ke liye subject-wise strategy, exam pattern, syllabus, aur best preparation tips jaanin.',
    metaTitle: 'SSC CGL Exam Preparation Strategy in Hinglish | SarkariPulse',
    metaDescription: 'SSC CGL exam ki taiyari kaise karein? Jaaniye subject-wise tips, Tier 1 aur Tier 2 exam pattern, best books aur mock tests ki poori strategy Hinglish mein.',
    category: 'Exam Preparation',
    date: '2026-06-20',
    readTime: '6 min read',
    icon: '📚',
    tags: ['ssc', 'ssc-cgl', 'exam-tips', 'preparation'],
    content: `
      <p>Staff Selection Commission (SSC) dwara aayojit ki jaane wali Combined Graduate Level (CGL) pariksha India ki sabse lokpriya aur pratiyogita-purna sarkari naukri parikshao mein se ek hai. Is pariksha ke madhyam se Central Secretariat, Income Tax, Excise, CBI, aur anya bade vibhago mein Group B aur Group C ke posts par niyukti ki jaati hai. Agar aap bhi is exam ko crack karna chahte hain, toh ek solid strategy aur sahi guidance ka hona bahut zaroori hai.</p>
      
      <h3>1. SSC CGL Exam Pattern Ko Samjhein</h3>
      <p>SSC CGL exam main roop se do charano (Tiers) mein aayojit kiya jata hai. Dono hi charano ka pattern digital aur computer-based (CBT) hota hai:</p>
      <table class="sp-table">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Subjects</th>
            <th>Questions / Marks</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tier 1 (Qualifying)</td>
            <td>Reasoning, Maths, English, GK</td>
            <td>100 Qs / 200 Marks</td>
            <td>60 Minutes</td>
          </tr>
          <tr>
            <td>Tier 2 (Merit Based)</td>
            <td>Maths, English, Reasoning, GK, Computer</td>
            <td>150 Qs / 450 Marks</td>
            <td>2 Hours 15 Mins</td>
          </tr>
        </tbody>
      </table>
      
      <h3>2. Subject-Wise Preparation Strategy</h3>
      <p>Har subject ka apna ek alag mahatva hai. Tier-2 mein English aur Reasoning ka weightage bahut jyada hota hai, isliye in par vishesh dhayan dene ki zaroorat hai:</p>
      <ul>
        <li><strong>Quantitative Aptitude (Mathematics):</strong> Arithmetic aur Advanced Maths dono par pakad banayein. Formula aur shortcuts ko ek notebook mein likhein. Daily calculation speed ko improve karne ke liye tables, squares, aur cubes ka practice karein.</li>
        <li><strong>English Comprehension:</strong> Grammar ke basic rules (Tenses, Active/Passive, Direct/Indirect) ko seekhein. Vocabulary strong karne ke liye daily English newspapers (jaise The Hindu) padhein aur new words ko note karein. Reading comprehension aur cloze test ka daily practice karein.</li>
        <li><strong>General Intelligence & Reasoning:</strong> Ye section sabse scoring hota hai. Coding-Decoding, Syllogism, Blood Relations, aur Series jaise topics ko daily practice se master kiya ja sakta hai. Purane papers se reasoning ke questions solve karein taaki logic samajh mein aaye.</li>
        <li><strong>General Awareness (GK/GS):</strong> Isme Static GK (History, Geography, Polity, Science) aur Current Affairs dono aate hain. Pichle 6-12 mahino ke main current events par dhayan dein. Har topic ke notes banayein taaki exam se pehle quick revision kiya ja sake.</li>
      </ul>

      <h3>3. Mock Tests aur Time Management</h3>
      <p>SSC CGL clear karne ki sabse badi chabi Mock Tests hain. Bina mocks ke exam clear karna namumkin hai:</p>
      <ul>
        <li>Hafte mein kam se kam 2-3 Mock Tests zaroor dein aur unka detail analysis karein.</li>
        <li>Analysis ke dauran apni galtiyon (weak areas) ko pehchanein aur unhe sudharein.</li>
        <li>Exam hall jaise environment mein time limit ke sath test dene ki aadat daalein taaki actual exam mein time management sahi rahe.</li>
      </ul>

      <h3>4. Best Preparation Resources & Books</h3>
      <p>Aapko apni taiyari ke liye basic resources aur books select karke unhe baar-baar padhna chahiye. Kiran Publication ki Previous Years Solve papers math, English, aur reasoning ke liye best hain. English Grammar ke liye Neetu Singh (KD Campus) Vol 1 aur GK ke liye Lucent's General Knowledge book padhna kafi faydemand hoga.</p>
    `
  },
  {
    slug: 'upsc-exam-pattern-guide',
    title: 'UPSC Civil Services Exam Pattern: Prelims, Mains aur Interview Ke Niyam',
    description: 'IAS/IPS banane ke liye UPSC Civil Services Examination (CSE) ke teenon charano ke niyam, syllabus aur marking scheme samjhein.',
    metaTitle: 'UPSC Civil Services Exam Pattern 2026 in Hinglish | SarkariPulse',
    metaDescription: 'IAS/IPS banne ke liye UPSC exam pattern kya hai? Prelims, Mains aur Interview ke complete syllabus, qualifying marks aur strategy ko yahan detail mein samjhein.',
    category: 'Exam Pattern',
    date: '2026-06-19',
    readTime: '7 min read',
    icon: '🏛️',
    tags: ['upsc', 'ias', 'civil-services', 'exam-pattern'],
    content: `
      <p>Union Public Service Commission (UPSC) Civil Services Examination (CSE) poore desh ki sabse pratishthit pariksha hai. Iske madhyam se IAS, IPS, IFS, IRS aur anya A-grade administrative services mein candidates ka selection kiya jata hai. Is exam ko crack karne ke liye iske teenon charano (Stages) ko gahrai se samajhna sabse pehla kadam hai.</p>

      <h3>Stage 1: UPSC Preliminary Examination (Qualifying)</h3>
      <p>Prelims exam ek objective type (Multiple Choice Questions) test hota hai. Isme do compulsory papers hote hain jo ek hi din mein conduct hote hain:</p>
      <ul>
        <li><strong>Paper I: General Studies (GS):</strong> Isme History, Geography, Polity, Economics, Science & Tech, Environment, aur Current Affairs se 100 questions (200 marks) aate hain. Is paper ke marks se hi Prelims cutoff decide hoti hai. Negative marking 1/3rd hoti hai.</li>
        <li><strong>Paper II: Civil Services Aptitude Test (CSAT):</strong> Isme Maths, Reasoning, Reading Comprehension, aur Decision Making ke 80 questions (200 marks) hote hain. Ye paper <strong>strictly qualifying</strong> hota hai, jismein pass hone ke liye minimum <strong>33% marks (66 marks)</strong> laana compulsory hai.</li>
      </ul>

      <h3>Stage 2: UPSC Mains Examination (Written Descriptive)</h3>
      <p>Jo candidates Prelims pass karte hain, unhe Mains pariksha likhni hoti hai. Mains ek descriptive pen-paper exam hai jismein kul 9 subjective papers hote hain. Inme se 7 papers ke marks final merit list mein judte hain aur 2 language papers qualifying hote hain:</p>
      <table class="sp-table">
        <thead>
          <tr>
            <th>Paper Name</th>
            <th>Subject Detail</th>
            <th>Total Marks</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Paper A</td>
            <td>Any Indian Language (from 8th Schedule)</td>
            <td>300 Marks</td>
            <td>Qualifying (25%)</td>
          </tr>
          <tr>
            <td>Paper B</td>
            <td>English Language</td>
            <td>300 Marks</td>
            <td>Qualifying (25%)</td>
          </tr>
          <tr>
            <td>Paper I</td>
            <td>Essay (Nibandh)</td>
            <td>250 Marks</td>
            <td>Merit-Counted</td>
          </tr>
          <tr>
            <td>Paper II (GS-1)</td>
            <td>History, Geography, Society</td>
            <td>250 Marks</td>
            <td>Merit-Counted</td>
          </tr>
          <tr>
            <td>Paper III (GS-2)</td>
            <td>Polity, Governance, Constitution, IR</td>
            <td>250 Marks</td>
            <td>Merit-Counted</td>
          </tr>
          <tr>
            <td>Paper IV (GS-3)</td>
            <td>Economy, Science, Environment, Security</td>
            <td>250 Marks</td>
            <td>Merit-Counted</td>
          </tr>
          <tr>
            <td>Paper V (GS-4)</td>
            <td>Ethics, Integrity & Aptitude</td>
            <td>250 Marks</td>
            <td>Merit-Counted</td>
          </tr>
          <tr>
            <td>Paper VI</td>
            <td>Optional Subject Paper 1</td>
            <td>250 Marks</td>
            <td>Merit-Counted</td>
          </tr>
          <tr>
            <td>Paper VII</td>
            <td>Optional Subject Paper 2</td>
            <td>250 Marks</td>
            <td>Merit-Counted</td>
          </tr>
        </tbody>
      </table>
      <p>Mains exam ke total score-counting papers ka sum <strong>1750 Marks</strong> hota hai. Har paper ke liye 3 ghante ka samay milta hai.</p>

      <h3>Stage 3: Personality Test (Interview)</h3>
      <p>Mains cut-off clear karne wale candidates ko Dholpur House, New Delhi mein personality test ke liye bulaya jata hai. UPSC Interview kul <strong>275 Marks</strong> ka hota hai. Isme candidate ke analytical power, decision making capability, leadership quality, integrity, aur current happenings par knowledge ko assess kiya jata hai.</p>
      <p>Final merit list <strong>Mains (1750 marks) + Interview (275 marks) = 2025 Marks</strong> ke total score ke aadhar par banti hai, jiske bad IAS, IPS, IFS etc. ki posts allot ki jaati hain.</p>
    `
  },
  {
    slug: 'railway-group-d-syllabus-guide',
    title: 'Railway Group D Syllabus: Complete Syllabus, Exam Pattern aur PET ke Niyam',
    description: 'RRB/RRC Group D level 1 exam ka subject-wise computer exam syllabus aur Physical Efficiency Test details.',
    metaTitle: 'Railway Group D Syllabus & Exam Pattern | SarkariPulse',
    metaDescription: 'Railway Group D Level 1 exam syllabus aur selection process check karein. CBT exam subjects, marks allocation aur physical test rules ki poori jankari Hinglish mein.',
    category: 'Syllabus',
    date: '2026-06-18',
    readTime: '5 min read',
    icon: '🚆',
    tags: ['railway', 'rrb-group-d', 'syllabus', 'physical-test'],
    content: `
      <p>Indian Railways (RRB/RRC) dwara aayojit ki jaane wali Group D (Level-1 posts jaise Track Maintainer, Assistant, Pointsman) pariksha poore desh mein sabse badi bharti parikshao mein se ek hai. Isme selection paane ke liye candidates ko online exam (Computer Based Test) aur physical standard test dono clear karne hote hain. Aaiye iske syllabus aur rules ko detail mein jaante hain.</p>

      <h3>1. RRC Group D CBT Exam Pattern</h3>
      <p>Online test ek objective paper hota hai jismein kul 100 questions hote hain aur isme 1/3rd negative marking hoti hai. Exam duration 90 minutes (divyang candidates ke liye 120 minutes) hoti hai:</p>
      <table class="sp-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>No. of Questions</th>
            <th>Total Marks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>General Science (Vigyan)</td>
            <td>25 Questions</td>
            <td>25 Marks</td>
          </tr>
          <tr>
            <td>Mathematics (Ganit)</td>
            <td>25 Questions</td>
            <td>25 Marks</td>
          </tr>
          <tr>
            <td>General Intelligence & Reasoning</td>
            <td>30 Questions</td>
            <td>30 Marks</td>
          </tr>
          <tr>
            <td>General Awareness & Current Affairs</td>
            <td>20 Questions</td>
            <td>20 Marks</td>
          </tr>
          <tr style="font-weight: bold;">
            <td>Total</td>
            <td>100 Questions</td>
            <td>100 Marks</td>
          </tr>
        </tbody>
      </table>

      <h3>2. Subject-Wise Syllabus Topics</h3>
      <ul>
        <li><strong>Mathematics:</strong> Number System, BODMAS, Decimals, Fractions, LCM & HCF, Ratio & Proportion, Percentage, Mensuration, Time & Work, Time & Distance, Simple & Compound Interest, Profit & Loss, Algebra, Geometry, Trigonometry, aur Elementary Statistics.</li>
        <li><strong>General Science:</strong> Isme 10th standard level ki Physics, Chemistry, aur Life Sciences (Biology) ke practical applications aur basics se related questions aate hain. NCERT books iske liye best source hain.</li>
        <li><strong>General Intelligence & Reasoning:</strong> Analogies, Alphabetical & Number Series, Coding-Decoding, Mathematical Operations, Relationships, Syllogism, Jumbling, Venn Diagram, Data Interpretation, Decision Making, Classification, Directions, aur Statement-Arguments.</li>
        <li><strong>General Awareness:</strong> Science & Technology, Sports, Culture, Personalities, Economics, Politics aur pichle 1 saal ka Current Affairs.</li>
      </ul>

      <h3>3. Physical Efficiency Test (PET) Rules</h3>
      <p>CBT merit clear karne wale candidates ko physical test ke liye bulaya jata hai. Male aur female candidates ke liye standard alag-alag hain:</p>
      <p><strong>For Male Candidates:</strong></p>
      <ul>
        <li>35 kg ka wazan utha kar 100 meters ki doori 2 minutes mein bina wazan neeche giraaye poori karni hogi (sirf 1 chance milega).</li>
        <li>1000 meters (1 km) ki daud 4 minutes 15 seconds mein poori karni hogi (sirf 1 chance).</li>
      </ul>
      <p><strong>For Female Candidates:</strong></p>
      <ul>
        <li>20 kg ka wazan utha kar 100 meters ki doori 2 minutes mein bina wazan neeche giraaye poori karni hogi.</li>
        <li>1000 meters (1 km) ki daud 5 minutes 40 seconds mein poori karni hogi.</li>
      </ul>
    `
  },
  {
    slug: '10th-pass-sarkari-jobs-guide',
    title: '10th Pass Ke Liye Best Sarkari Jobs: Career Options aur High Salary Posts',
    description: 'Matriculation/10th pass candidates ke liye popular government jobs jaise SSC MTS, GD Constable, Railway aur Post Office GDS ki jankari.',
    metaTitle: 'Best Government Jobs for 10th Pass Candidates | SarkariPulse',
    metaDescription: '10th pass hone ke baad kaun si sarkari naukri mil sakti hai? SSC MTS, Railway, GDS, Police Constable aur Defence recruitment ki poori list aur details yahan dekhein.',
    category: 'Job Alert Guides',
    date: '2026-06-17',
    readTime: '5 min read',
    icon: '🎓',
    tags: ['10th-pass', 'sarkari-naukri', 'career-guide', 'railway-jobs'],
    content: `
      <p>Agar aapne haal hi mein matric (10th standard) pass kiya hai aur aap ek secure aur stable career banana chahte hain, toh government sector aapke liye kai behtareen opportunities offer karta hai. Bahut se logo ko lagta hai ki high-paying jobs ke liye graduation zaroori hai, par aisa nahi hai. SSC, Railway, Defense, aur Department of Posts mein 10th pass candidates ke liye kaafi aakarshak salary aur benefits wali posts available hain.</p>

      <h3>1. Staff Selection Commission (SSC) Jobs</h3>
      <p>SSC har saal 10th pass candidates ke liye national level par do badi parikshayein aayojit karta hai:</p>
      <ul>
        <li><strong>SSC MTS (Multi-Tasking Staff):</strong> Isme non-technical posts jaise Peon, Daftary, Jamadar, Chowkidar, aur Mali aate hain. Iske sath hi Havaldar (CBIC aur CBN) ki post par recruitment hoti hai. Isme single CBT exam hota hai aur job security bahut badhiya milti hai. Initial salary ₹25,000 to ₹30,000 pm hoti hai.</li>
        <li><strong>SSC GD Constable:</strong> BSF, CISF, CRPF, SSB, ITBP, AR, aur SSF mein constable banne ke liye ye sabse popular exam hai. Exam clear karne ke liye CBT aur physical fitness test dono pass karna hota hai. Initial salary range ₹30,000+ per month hoti hai plus central government allowances milte hain.</li>
      </ul>

      <h3>2. Railway Recruitment Cell (RRC) & Board (RRB)</h3>
      <p>Railways 10th pass candidates ke liye sabse bada employer hai. Isme Level 1 posts (pehla Group D) par broad level recruitment ki jaati hai. Track Maintainer Grade IV, Assistant Pointsman, aur helper posts par direct matriculate apply kar sakte hain. Initial salary basic pay ₹18,000 ke sath NDA, HRA, TA milakar lagbhag ₹26,000+ per month banti hai.</p>

      <h3>3. Indian Post Office (GDS Recruitment)</h3>
      <p>Department of Posts dwara har saal lagbhag 30,000 se 40,000 Gramin Dak Sevak (GDS), Branch Postmaster (BPM), aur Assistant Branch Postmaster (ABPM) ki vacancies jaari ki jaati hain. Is bharti ka sabse bada benefit ye hai ki isme <strong>koi exam nahi hota</strong>; candidates ka selection purely unke <strong>10th class ke marks/percentage de aadhar par</strong> merit list banakar kiya jata hai. Initial salary ₹12,000 to ₹15,000 hoti hai par duty timing 4-5 ghante ki hoti hai.</p>

      <h3>4. State Police Constables & Forest Guard</h3>
      <p>Lgabhag sabhi state governments (UP Police, Bihar Police, MP Police, Rajasthan Police) 10th ya 12th pass qualifications par constables aur forest guards ki recruitment nikaalti hain. Inme basic salary, medical facilities, aur grade pay milkar bahut handsome package milta hai. Career growth ke chances bhi achhe hote hain.</p>
    `
  },
  {
    slug: 'police-bharti-physical-tips-guide',
    title: 'Police Bharti Physical Test Rules: Running, Height aur Weight Kaise Clear Karein',
    description: 'Police bharti physical efficiency test (PET) aur physical measurement test (PST) ko clear karne ke liye important training aur requirements.',
    metaTitle: 'Police Bharti Physical Test Tips & Rules | SarkariPulse',
    metaDescription: 'Police Bharti running aur physical measurements (height, chest) clear karne ki tips. Delhi, UP, Bihar Police PET/PST standards aur stamina building strategy Hinglish mein.',
    category: 'Exam Preparation',
    date: '2026-06-16',
    readTime: '6 min read',
    icon: '🏃‍♂️',
    tags: ['police-bharti', 'physical-test', 'running-tips', 'fitness'],
    content: `
      <p>State Police (UP, Bihar, Delhi, MP, Rajasthan etc.) ya Paramilitary forces (SSC GD, BSF, CRPF) ki bharti mein online exam pass karne ke sath hi **Physical Test (PET & PST)** ko clear karna sabse bada hurdle hota hai. Likhit pariksha mein top marks aane ke baad bhi agar candidate height ya running ke criteria mein fail ho jaye toh poori mehnat bekaar chali jaati hai. Isliye physical test ki taiyari shuru se hi karni chahiye.</p>

      <h3>1. General Physical Standards (PST) Requirements</h3>
      <p>Aamtaur par sabhi state aur central police bhartiyo mein minimum physical standards is tarah hote hain (reserved categories ko chhoot milti hai):</p>
      <table class="sp-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Male Height</th>
            <th>Female Height</th>
            <th>Male Chest Expansion</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>General / OBC</td>
            <td>168 - 170 cm</td>
            <td>152 - 157 cm</td>
            <td>79 - 80 cm (+5 cm expansion)</td>
          </tr>
          <tr>
            <td>SC / ST</td>
            <td>160 - 165 cm</td>
            <td>147 - 150 cm</td>
            <td>76 - 77 cm (+5 cm expansion)</td>
          </tr>
        </tbody>
      </table>

      <h3>2. Physical Efficiency Test (PET) - Running Rules</h3>
      <p>Running test alag-alag forces mein alag-alag timing ke sath aayojit kiya jata hai. Jaise:</p>
      <ul>
        <li><strong>SSC GD / Paramilitary:</strong> Male candidates ke liye 5 KM running 24 minutes mein, female candidates ke liye 1.6 KM daud 8 minutes 30 seconds mein.</li>
        <li><strong>State Police (e.g. UP Police):</strong> Male candidates ko 4.8 KM running 25 minutes mein aur female candidates ko 2.4 KM running 14 minutes mein poori karni hoti hai.</li>
      </ul>

      <h3>3. Running Stamina Aur Speed Badhane Ke Tips</h3>
      <p>Agar aapne daudna abhi shuru kiya hai ya aapka time limits se jyada aa raha hai, toh in tips ko zaroor follow karein:</p>
      <ul>
        <li><strong>Gradual Progress:</strong> Pehle hi din fast bhagne ki koshish na karein. Pehle 1-2 hafte normal jogging karke stamina build karein. Dheere-dheere distance badhayein (3 km, 4 km aur phir 5 km).</li>
        <li><strong>Interval Training:</strong> Hafte mein ek din fast running (sprinting) karein. 400 meters fast bhagein, phir 1 minute walk karein, aur isse 5-6 baar repeat karein. Isse cardiorespiratory strength badhti hai.</li>
        <li><strong>Proper Footwear:</strong> running ke liye hamesha flexible, comfortable running shoes ka hi use karein. Heavy ya hard-soled shoes se shin pain aur muscle cramps hone ka khatra badh jata hai.</li>
        <li><strong>Diet and Hydration:</strong> Apne diet mein high protein (chana, moong, ande, paneer) aur energy resources (kela, oats) add karein. Body ko hydrated rakhne ke liye din bhar paani aur nimbu paani/ORS peeyein.</li>
      </ul>

      <h3>4. Chest Expansion ki Problem Kaise Door Karein?</h3>
      <p>Bahut se male candidates height hone ke baad bhi chest measurement ya expansion (+5 cm) mein bahar ho jaate hain. Iske liye daily subah aur shaam ko push-ups (dand-baithak) karein. Pull-ups (chin-ups) lagane se back aur chest broad hoti hai. Deep breathing exercises (Pranayama) se lungs ki expansion capability badhti hai.</p>
    `
  },
  {
    slug: 'sarkari-job-document-verification-guide',
    title: 'Sarkari Job Document Verification: Zaroori Documents aur Rejection Se Kaise Bachein',
    description: 'Government jobs selection ke final stage, Document Verification (DV) ke liye important certificates, dates aur validity rules ki checklist.',
    metaTitle: 'Sarkari Job Document Verification (DV) Checklist | SarkariPulse',
    metaDescription: 'Sarkari Naukri Document Verification (DV) rules aur checklist. Category certificates (OBC, EWS), educational marksheet validity aur name matching tips Hinglish mein.',
    category: 'Job Alert Guides',
    date: '2026-06-15',
    readTime: '6 min read',
    icon: '📋',
    tags: ['document-verification', 'dv-tips', 'caste-certificate', 'ews'],
    content: `
      <p>Kisi bhi government exam ke saare stages (Written Exam, Physical, Skill Test, Interview) pass karne ke bad jo final level hota hai, use **Document Verification (DV)** kehte hain. DV mein aapke dwara application form mein di gayi details ko real documents se physical verify kiya jata hai. Har saal hazaron qualified candidates sirf is stage par choti-choti galtiyon (caste certificate date issue, name spelling error, graduation date mismatch) ki wajah se reject ho jaate hain.</p>

      <h3>1. Universal Document Verification Checklist</h3>
      <p>Jab aap kisi bhi DV panel ke saamne jaate hain, toh aamtaur par in documents ki original copies aur self-attested photostat copies maangi jaati hain:</p>
      <ul>
        <li><strong>10th Class Marksheet & Certificate:</strong> Ye aapki Date of Birth (DOB) aur Name validation ka sabse bada proof mana jata hai. Spellings bilkul exact honi chahiye.</li>
        <li><strong>12th Class Marksheet & Certificate:</strong> Higher secondary eligibility posts ke liye.</li>
        <li><strong>Graduation/Diploma/ITI Marksheets & Degree:</strong> All semesters/years marksheets ke sath graduation degree compulsory hoti hai. Agar provisional degree hai, toh uski validity check kar lein.</li>
        <li><strong>Caste / Category Certificate:</strong> Agar aapne Reservation (SC, ST, OBC, EWS, PwBD) claim kiya hai. OBC-NCL aur EWS certificates central government format mein aur financial year ke dynamic rules ke according current year ke hone chahiye.</li>
        <li><strong>Domicile / Residence Certificate:</strong> State level vacancies mein reservation aur native claim ke liye.</li>
        <li><strong>Identity Proofs:</strong> Aadhaar Card, PAN Card, Voter ID, ya Driving License (sabhi par name/DOB original certificates se match hona chahiye).</li>
        <li><strong>No Objection Certificate (NOC):</strong> Agar aap pehle se kisi semi-govt, state, ya central govt post par job kar rahe hain.</li>
      </ul>

      <h3>2. Category Certificates Validity Issues (Crucial)</h3>
      <p>AdSense review ke liye aur candidates ke guidance ke liye ye important details hum table mein de rahe hain:</p>
      <table class="sp-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Certificate Type Needed</th>
            <th>Validity Period / Crucial Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>OBC (Non-Creamy Layer)</td>
            <td>Central Govt Format (not State Govt)</td>
            <td>Notification ke crucial date se 3 saal se zyada purana na ho.</td>
          </tr>
          <tr>
            <td>EWS (Economically Weaker)</td>
            <td>Income & Asset Certificate</td>
            <td>Chalu Financial Year (F.Y.) ka valid hona chahiye (Financial and Assessment year matched).</td>
          </tr>
          <tr>
            <td>SC / ST</td>
            <td>Standard Format</td>
            <td>Aamtaur par lifetime valid hote hain, par format modern digital hona chahiye.</td>
          </tr>
        </tbody>
      </table>

      <h3>3. Name Spelling Aur DOB Mismatch Ka Solution</h3>
      <p>Agar aapke kisi mark sheet ya certificate mein naam (ya pita ka naam) ki spelling mein mismatch ho, jaise matric marksheet mein "Sanjay" aur Aadhaar mein "Sanjay Kumar", ya phir graduation degree mein surname miss ho, toh iske liye DV se pehle **First Class Magistrate** dwara verified **Notarized Affidavit (shapath patra)** banwa lein. Affidavit mein clear likha hona chahiye ki dono naam ek hi vyakti ke hain. Ye lagbhag har jagah accept ho jata hai.</p>

      <h3>4. Safe Rejection Prevention Checklist</h3>
      <ul>
        <li>Sare documents ke kam se kam <strong>3 self-attested photocopies set</strong> tayyar rakhein.</li>
        <li>Application form bharte samay upload kiye gaye photo ke kam se kam <strong>8-10 identical passport-size photos</strong> sath lekar jayein.</li>
        <li>Apne certificates ko chronological order mein plastic folder mein set karke rakhein taaki wahan confusion na ho.</li>
      </ul>
    `
  }
];

export const getGuideBySlug = (slug: string): Guide | undefined => {
  return guides.find(g => g.slug === slug);
};
