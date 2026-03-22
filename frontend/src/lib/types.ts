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
