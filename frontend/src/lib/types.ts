export type JobCategory = 'job' | 'result' | 'admit-card' | 'admission' | 'scholarship' | 'exam-form';

export type JobListItem = {
  _id: string;
  title: string;
  slug: string;
  category: JobCategory;
  summary: string;
  state: string;
  organization: string;
  vacancyCount: number;
  lastDate?: string;
  tags: string[];
  createdAt: string;
  viewCount?: number;
};

export type JobDetail = JobListItem & {
  content: string;
  eligibility: string;
  importantDates: string;
  qualificationLevel: string;
  applyLink: string;
  salary: string;
  metaTitle: string;
  metaDescription: string;
  status: string;
  sourceUrl: string;
  sourceName: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type StatsData = {
  totalJobs: number;
  last24Hours: number;
  categories: Record<string, number>;
  topStates: { state: string; count: number }[];
};

export const CATEGORY_LABELS: Record<JobCategory, string> = {
  job: 'Sarkari Naukri',
  result: 'Result',
  'admit-card': 'Admit Card',
  admission: 'Admission',
  scholarship: 'Scholarship',
  'exam-form': 'Exam Form',
};

export const CATEGORY_EMOJI: Record<JobCategory, string> = {
  job: '💼',
  result: '📊',
  'admit-card': '🎫',
  admission: '🎓',
  scholarship: '💰',
  'exam-form': '📝',
};

export const CATEGORY_COLORS: Record<JobCategory, string> = {
  job: 'bg-emerald-100 text-emerald-700',
  result: 'bg-blue-100 text-blue-700',
  'admit-card': 'bg-purple-100 text-purple-700',
  admission: 'bg-amber-100 text-amber-700',
  scholarship: 'bg-teal-100 text-teal-700',
  'exam-form': 'bg-rose-100 text-rose-700',
};

// Scheme Types
export type SchemeType = 'central' | 'state';

export type SchemeListItem = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  schemeType: SchemeType;
  state: string;
  department: string;
  thumbnailUrl?: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
};

export type SchemeDetail = SchemeListItem & {
  description: string;
  launchDate?: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  applyLink?: string;
  officialWebsite?: string;
  helplineNumber?: string;
  metaTitle: string;
  metaDescription: string;
  lastVerified?: string;
  updatedAt?: string;
};

export type SchemeFilters = {
  schemeType?: SchemeType;
  state?: string;
  search?: string;
};

export const SCHEME_TYPE_LABELS: Record<SchemeType, string> = {
  central: 'Central Scheme',
  state: 'State Scheme',
};

export const SCHEME_TYPE_EMOJI: Record<SchemeType, string> = {
  central: '🇮🇳',
  state: '🏛️',
};

export const SCHEME_TYPE_COLORS: Record<SchemeType, string> = {
  central: 'bg-blue-100 text-blue-700',
  state: 'bg-green-100 text-green-700',
};
