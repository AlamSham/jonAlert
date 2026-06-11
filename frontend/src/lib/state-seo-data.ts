/**
 * State-level SEO data for enriching state landing pages.
 * Each state entry contains PSC body name, recruitment boards, popular exams,
 * and the capital city (used in structured data).
 */

export interface StateSEOInfo {
  psc: string;
  boards: string[];
  popularExams: string[];
  capital: string;
}

export const STATE_SEO_DATA: Record<string, StateSEOInfo> = {
  'Uttar Pradesh': {
    psc: 'UPPSC',
    boards: ['UPSSSC', 'UPPRPB', 'UPSESSB'],
    popularExams: ['UPPSC PCS', 'UPSSSC PET', 'UP Police Constable', 'UP TGT/PGT', 'UP Lekhpal', 'UP SI'],
    capital: 'Lucknow',
  },
  'Bihar': {
    psc: 'BPSC',
    boards: ['BTSC', 'CSBC', 'BSSC'],
    popularExams: ['BPSC TRE', 'Bihar Police SI', 'Bihar Daroga', 'BPSC 70th', 'BSSC Inter Level'],
    capital: 'Patna',
  },
  'Rajasthan': {
    psc: 'RPSC',
    boards: ['RSSB', 'RSMSSB'],
    popularExams: ['RPSC RAS', 'Rajasthan Police', 'Rajasthan Patwari', 'REET', 'Rajasthan SI'],
    capital: 'Jaipur',
  },
  'Madhya Pradesh': {
    psc: 'MPPSC',
    boards: ['MPESB', 'MP Vyapam', 'MPPEB'],
    popularExams: ['MPPSC State Service', 'MP Police Constable', 'MP Patwari', 'MP TET', 'MP SI'],
    capital: 'Bhopal',
  },
  'Maharashtra': {
    psc: 'MPSC',
    boards: ['Maharashtra TET Board', 'Maharashtra Police'],
    popularExams: ['MPSC State Service', 'Maharashtra Police', 'Maharashtra Talathi', 'MHT CET'],
    capital: 'Mumbai',
  },
  'West Bengal': {
    psc: 'WBPSC',
    boards: ['WBSSC', 'WB Police Recruitment Board'],
    popularExams: ['WBPSC WBCS', 'WB Police SI', 'WB Primary TET', 'WB Group D', 'KP Constable'],
    capital: 'Kolkata',
  },
  'Andhra Pradesh': {
    psc: 'APPSC',
    boards: ['AP Police', 'AP DSC'],
    popularExams: ['APPSC Group 1/2', 'AP Police Constable', 'AP TET/DSC', 'AP Grama Sachivalayam', 'AP Ward Sachivalayam'],
    capital: 'Amaravati',
  },
  'Chhattisgarh': {
    psc: 'CGPSC',
    boards: ['CG Vyapam', 'CGPEB'],
    popularExams: ['CGPSC State Service', 'CG Police', 'CG Patwari', 'CG TET', 'CG Forest Guard'],
    capital: 'Raipur',
  },
  'Jharkhand': {
    psc: 'JPSC',
    boards: ['JSSC', 'Jharkhand Police'],
    popularExams: ['JPSC Civil Services', 'JSSC CGL', 'Jharkhand Police', 'Jharkhand Home Guard'],
    capital: 'Ranchi',
  },
  'Himachal Pradesh': {
    psc: 'HPPSC',
    boards: ['HPSSC', 'HP Police'],
    popularExams: ['HPPSC HAS', 'HPSSC JOA', 'HP Police Constable', 'HP TET', 'HP Home Guard'],
    capital: 'Shimla',
  },
  'Tamil Nadu': {
    psc: 'TNPSC',
    boards: ['TRB', 'TNUSRB'],
    popularExams: ['TNPSC Group 1/2/4', 'TN Police SI', 'TN TRB', 'TN Forest Guard'],
    capital: 'Chennai',
  },
  'Karnataka': {
    psc: 'KPSC',
    boards: ['KEA', 'Karnataka Police'],
    popularExams: ['KPSC KAS', 'Karnataka Police', 'KEA', 'Karnataka FDA/SDA'],
    capital: 'Bengaluru',
  },
  'Kerala': {
    psc: 'Kerala PSC',
    boards: ['Kerala PSC'],
    popularExams: ['Kerala PSC Degree Level', 'Kerala PSC 10th Level', 'Kerala Police', 'Kerala LDC'],
    capital: 'Thiruvananthapuram',
  },
  'Gujarat': {
    psc: 'GPSC',
    boards: ['GSSSB', 'Gujarat Police'],
    popularExams: ['GPSC Class 1/2', 'GSSSB Clerk', 'Gujarat Police', 'Gujarat Talati', 'Gujarat Bin Sachivalay'],
    capital: 'Gandhinagar',
  },
  'Haryana': {
    psc: 'HPSC',
    boards: ['HSSC', 'Haryana Police'],
    popularExams: ['HPSC HCS', 'HSSC CET', 'Haryana Police', 'HSSC Clerk', 'Haryana Patwari'],
    capital: 'Chandigarh',
  },
  'Punjab': {
    psc: 'PPSC',
    boards: ['PSSSB', 'Punjab Police'],
    popularExams: ['PPSC Civil Services', 'Punjab Police', 'PSSSB Clerk', 'Punjab Patwari'],
    capital: 'Chandigarh',
  },
  'Odisha': {
    psc: 'OPSC',
    boards: ['OSSC', 'OSSSC'],
    popularExams: ['OPSC OCS', 'OSSC CGL', 'OSSSC RI/ARI', 'Odisha Police'],
    capital: 'Bhubaneswar',
  },
  'Telangana': {
    psc: 'TGPSC',
    boards: ['TSPSC', 'Telangana Police'],
    popularExams: ['TGPSC Group 1/2', 'Telangana Police SI', 'Telangana DSC', 'TS ECET'],
    capital: 'Hyderabad',
  },
  'Uttarakhand': {
    psc: 'UKPSC',
    boards: ['UKSSSC', 'Uttarakhand Police'],
    popularExams: ['UKPSC PCS', 'UKSSSC', 'Uttarakhand Police', 'UK Forest Guard', 'Uttarakhand Patwari'],
    capital: 'Dehradun',
  },
  'Assam': {
    psc: 'APSC',
    boards: ['SLRC', 'Assam Police'],
    popularExams: ['APSC CCE', 'Assam Police SI', 'Assam Direct Recruitment', 'SLRC Grade 3/4'],
    capital: 'Dispur',
  },
  'Delhi': {
    psc: 'DSSSB',
    boards: ['Delhi Police', 'DSSSB'],
    popularExams: ['DSSSB TGT/PGT', 'Delhi Police Constable', 'DSSSB LDC', 'Delhi Metro'],
    capital: 'New Delhi',
  },
  'Jammu and Kashmir': {
    psc: 'JKPSC',
    boards: ['JKSSB', 'JK Police'],
    popularExams: ['JKPSC KAS', 'JKSSB', 'JK Police', 'JK Banking'],
    capital: 'Srinagar',
  },
  'Manipur': {
    psc: 'MPSC Manipur',
    boards: ['Manipur Police'],
    popularExams: ['Manipur PSC', 'Manipur Police', 'Manipur Civil Service'],
    capital: 'Imphal',
  },
  'Meghalaya': {
    psc: 'MPSC Meghalaya',
    boards: ['Meghalaya Police'],
    popularExams: ['Meghalaya PSC', 'Meghalaya Police', 'Meghalaya Civil Service'],
    capital: 'Shillong',
  },
  'Mizoram': {
    psc: 'MPSC Mizoram',
    boards: ['Mizoram Police'],
    popularExams: ['Mizoram PSC', 'Mizoram Police', 'Mizoram Civil Service'],
    capital: 'Aizawl',
  },
  'Nagaland': {
    psc: 'NPSC',
    boards: ['Nagaland Police'],
    popularExams: ['Nagaland PSC', 'Nagaland Police', 'Nagaland Civil Service'],
    capital: 'Kohima',
  },
  'Arunachal Pradesh': {
    psc: 'APPSC',
    boards: ['Arunachal Police'],
    popularExams: ['APPSC Civil Service', 'Arunachal Police', 'Arunachal Pradesh Govt Jobs'],
    capital: 'Itanagar',
  },
  'Tripura': {
    psc: 'TPSC',
    boards: ['TRBT', 'Tripura Police'],
    popularExams: ['TPSC Civil Service', 'TRBT', 'Tripura Police'],
    capital: 'Agartala',
  },
  'Sikkim': {
    psc: 'SPSC',
    boards: ['Sikkim Police'],
    popularExams: ['SPSC', 'Sikkim Police', 'Sikkim Govt Jobs'],
    capital: 'Gangtok',
  },
  'Goa': {
    psc: 'GPSC Goa',
    boards: ['Goa Police'],
    popularExams: ['Goa PSC', 'Goa Police', 'Goa Govt Jobs'],
    capital: 'Panaji',
  },
};

/**
 * Get SEO info for a state. Returns a fallback if the state is not found.
 */
export function getStateSEOInfo(stateName: string): StateSEOInfo {
  return STATE_SEO_DATA[stateName] || {
    psc: `${stateName} PSC`,
    boards: [`${stateName} Recruitment Board`],
    popularExams: [`${stateName} Govt Jobs`, `${stateName} Police`],
    capital: stateName,
  };
}
