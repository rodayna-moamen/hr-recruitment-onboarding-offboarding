import apiClient from '../lib/apiClient';
import { JobRequisition, JobTemplate, Application, ApplicationStage, ApplicationStatus } from '../types/recruitment';

// ==========================================
// JOB TEMPLATES
// ==========================================

export async function fetchJobTemplates(): Promise<{ data: JobTemplate[] }> {
  const response = await apiClient.get('/templates');
  // Backend returns the array directly, not wrapped in { data: ... }
  return { data: Array.isArray(response.data) ? response.data : [] };
}

// ==========================================
// JOB REQUISITIONS
// ==========================================

export async function fetchJobRequisitions(): Promise<{ data: JobRequisition[] }> {
  const response = await apiClient.get('/jobs');
  // Backend returns the array directly, not wrapped in { data: ... }
  return { data: Array.isArray(response.data) ? response.data : [] };
}

export async function fetchJobRequisitionById(id: string): Promise<{ data: JobRequisition }> {
  return apiClient.get(`/jobs/${id}`);
}

export interface CreateJobRequisitionData {
  requisitionId: string;
  templateId?: string;
  openings: number;
  location?: string;
  hiringManagerId: string;
  postingDate?: string;
  expiryDate?: string;
  publishStatus?: 'draft' | 'published';
}

export async function createJobRequisition(data: CreateJobRequisitionData): Promise<{ data: JobRequisition }> {
  // Clean up the data: convert empty templateId to undefined, convert date strings to ISO format
  const payload: any = {
    requisitionId: data.requisitionId,
    openings: data.openings,
    hiringManagerId: data.hiringManagerId,
    publishStatus: data.publishStatus || 'draft',
  };
  
  // Only include templateId if it's not empty
  if (data.templateId && data.templateId.trim() !== '') {
    payload.templateId = data.templateId;
  }
  
  // Only include location if provided
  if (data.location && data.location.trim() !== '') {
    payload.location = data.location;
  }
  
  // Convert date strings to ISO format (backend expects Date objects)
  if (data.postingDate) {
    payload.postingDate = new Date(data.postingDate).toISOString();
  }
  if (data.expiryDate) {
    payload.expiryDate = new Date(data.expiryDate).toISOString();
  }
  
  return apiClient.post('/jobs', payload);
}

export interface UpdateJobRequisitionData {
  requisitionId?: string;
  templateId?: string;
  openings?: number;
  location?: string;
  hiringManagerId?: string;
  postingDate?: string;
  expiryDate?: string;
  publishStatus?: 'draft' | 'published';
}

export async function updateJobRequisition(id: string, data: UpdateJobRequisitionData): Promise<{ data: JobRequisition }> {
  // Clean up the data similar to create
  const payload: any = { ...data };
  
  // Only include templateId if it's not empty
  if (payload.templateId !== undefined && payload.templateId !== null && payload.templateId.trim() === '') {
    delete payload.templateId;
  }
  
  // Convert date strings to ISO format
  if (payload.postingDate) {
    payload.postingDate = new Date(payload.postingDate).toISOString();
  }
  if (payload.expiryDate) {
    payload.expiryDate = new Date(payload.expiryDate).toISOString();
  }
  
  return apiClient.put(`/jobs/${id}`, payload);
}

export async function publishJobRequisition(id: string): Promise<{ data: JobRequisition }> {
  return apiClient.post(`/jobs/${id}/publish`);
}

// ==========================================
// APPLICATIONS
// ==========================================

export interface FetchApplicationsParams {
  stage?: ApplicationStage | string;
  status?: ApplicationStatus | string;
}

export async function fetchApplications(params?: FetchApplicationsParams): Promise<{ data: Application[] }> {
  const queryParams = new URLSearchParams();
  if (params?.stage) queryParams.append('stage', params.stage);
  if (params?.status) queryParams.append('status', params.status);
  
  const queryString = queryParams.toString();
  const url = `/applications${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.get(url);
  // Backend returns the array directly, not wrapped in { data: ... }
  return { data: Array.isArray(response.data) ? response.data : [] };
}

export async function fetchApplicationById(id: string): Promise<{ data: Application }> {
  return apiClient.get(`/applications/${id}`);
}

export async function updateApplicationStatus(id: string, status: string): Promise<{ data: Application }> {
  return apiClient.post(`/applications/${id}/status`, { status });
}

export async function rejectApplication(id: string): Promise<void> {
  return apiClient.post(`/applications/${id}/reject`, {});
}
