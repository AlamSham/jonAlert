import { JobDetail, JobListItem, PaginatedResponse, StatsData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

async function safeFetch<T>(path: string, revalidate = 60): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getLatestJobs(limit = 12): Promise<JobListItem[]> {
  const data = await safeFetch<{ data: JobListItem[] }>(`/api/jobs/latest?limit=${limit}`);
  return data.data;
}

export async function getJobs(page = 1, limit = 20, category?: string): Promise<PaginatedResponse<JobListItem>> {
  let url = `/api/jobs?page=${page}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  return safeFetch<PaginatedResponse<JobListItem>>(url);
}

export async function getJobsByCategory(category: string, page = 1, limit = 20): Promise<PaginatedResponse<JobListItem>> {
  return safeFetch<PaginatedResponse<JobListItem>>(`/api/jobs/category/${category}?page=${page}&limit=${limit}`);
}

export async function getJobsByState(state: string, page = 1, limit = 20, category?: string): Promise<PaginatedResponse<JobListItem>> {
  let url = `/api/jobs/state/${encodeURIComponent(state)}?page=${page}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  return safeFetch<PaginatedResponse<JobListItem>>(url);
}

export async function getJobBySlug(slug: string): Promise<JobDetail | null> {
  const response = await fetch(`${API_BASE}/api/jobs/${slug}`, {
    next: { revalidate: 60 },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);

  const data = (await response.json()) as { data: JobDetail };
  return data.data;
}

export async function getTrendingJobs(limit = 6): Promise<JobListItem[]> {
  const data = await safeFetch<{ data: JobListItem[] }>(`/api/jobs/trending?limit=${limit}`);
  return data.data;
}

export async function searchJobs(q: string): Promise<JobListItem[]> {
  if (!q.trim()) return [];
  const data = await safeFetch<{ data: JobListItem[] }>(`/api/jobs/search?q=${encodeURIComponent(q)}`);
  return data.data;
}

export async function getStats(): Promise<StatsData> {
  const data = await safeFetch<{ data: StatsData }>('/api/stats', 120);
  return data.data;
}

export async function getRelatedJobs(slug: string): Promise<JobListItem[]> {
  try {
    const data = await safeFetch<{ data: JobListItem[] }>(`/api/jobs/${slug}/related`, 120);
    return data.data;
  } catch {
    return [];
  }
}
