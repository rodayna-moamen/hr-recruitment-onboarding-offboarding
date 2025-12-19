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
  try {
    const response = await apiClient.post(`/applications/${id}/status`, { status });
    return response;
  } catch (error: any) {
    console.error('Status update error:', error?.response?.data || error?.message);
    throw new Error(error?.response?.data?.message || error?.message || 'Failed to update status');
  }
}

export interface RejectionTemplate {
  subject: string;
  body: string;
  reason: string;
}

export async function rejectApplication(id: string, template: RejectionTemplate): Promise<void> {
  return apiClient.post(`/applications/${id}/reject`, template);
}

// ==========================================
// ONBOARDING
// ==========================================

export interface OnboardingTask {
  name: string;
  department?: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline?: string;
  completedAt?: string;
  documentId?: string;
  notes?: string;
}

export interface Onboarding {
  _id: string;
  employeeId: string;
  contractId: string;
  tasks: OnboardingTask[];
  completed: boolean;
  completedAt?: string;
}

export async function getOnboardingByEmployee(employeeId: string): Promise<{ data: Onboarding }> {
  return apiClient.get(`/onboarding/employee/${employeeId}`);
}

export async function getOnboardingById(id: string): Promise<{ data: Onboarding }> {
  return apiClient.get(`/onboarding/${id}`);
}

export interface CreateOnboardingChecklistData {
  name: string;
  description?: string;
  tasks: Array<{
    name: string;
    department?: string;
    deadline?: string;
    notes?: string;
  }>;
  role?: string;
  department?: string;
}

export async function createOnboardingChecklist(data: CreateOnboardingChecklistData): Promise<{ data: any }> {
  return apiClient.post('/onboarding/checklists', data);
}

export interface UpdateOnboardingTaskData {
  name?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  deadline?: string;
  completedAt?: string;
  documentId?: string;
  notes?: string;
}

export async function updateOnboardingTask(
  onboardingId: string,
  taskIndex: number,
  data: UpdateOnboardingTaskData,
): Promise<{ data: Onboarding }> {
  return apiClient.put(`/onboarding/${onboardingId}/tasks/${taskIndex}`, data);
}

export interface UploadDocumentData {
  type: 'cv' | 'contract' | 'id' | 'certificate' | 'resignation';
  filePath: string;
  ownerId?: string;
}

export async function uploadDocument(employeeId: string, data: UploadDocumentData): Promise<{ data: any }> {
  return apiClient.post(`/onboarding/${employeeId}/documents`, data);
}

export interface Contract {
  _id: string;
  offerId: string;
  acceptanceDate: string;
  grossSalary: number;
  signingBonus?: number;
  role: string;
  benefits?: string[];
  documentId?: string;
  employeeSignatureUrl?: string;
  employerSignatureUrl?: string;
  employeeSignedAt?: string;
  employerSignedAt?: string;
}

export async function getContractByOffer(offerId: string): Promise<{ data: Contract }> {
  return apiClient.get(`/contracts/offer/${offerId}`);
}

export async function getContractById(id: string): Promise<{ data: Contract }> {
  return apiClient.get(`/contracts/${id}`);
}

// ==========================================
// OFFBOARDING
// ==========================================

export interface TerminationRequest {
  _id: string;
  employeeId: string;
  initiator: 'employee' | 'hr' | 'manager';
  reason: string;
  employeeComments?: string;
  hrComments?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  terminationDate?: string;
  contractId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClearanceChecklist {
  _id: string;
  terminationId: string;
  items: Array<{
    department: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    updatedBy?: string;
    updatedAt?: string;
  }>;
  equipmentList: Array<{
    equipmentId: string;
    name: string;
    returned: boolean;
    condition?: string;
  }>;
  cardReturned: boolean;
}

export interface CreateResignationRequestData {
  employeeId: string;
  reason: string;
  employeeComments?: string;
  terminationDate?: string;
  contractId: string;
}

export async function createResignationRequest(
  data: CreateResignationRequestData,
): Promise<{ data: TerminationRequest }> {
  return apiClient.post('/termination-requests/resignation', {
    ...data,
    initiator: 'employee',
  });
}

export async function getResignationRequestsByEmployee(
  employeeId: string,
): Promise<{ data: TerminationRequest[] }> {
  return apiClient.get(`/termination-requests/employee/${employeeId}`);
}

export interface InitiateTerminationReviewData {
  employeeId: string;
  reason: string;
  hrComments?: string;
  warningIds?: string[];
  appraisalIds?: string[];
  managerRequestId?: string;
}

export async function initiateTerminationReview(
  data: InitiateTerminationReviewData,
): Promise<{ data: TerminationRequest }> {
  return apiClient.post('/termination-requests/review', data);
}

export async function getAllTerminationRequests(): Promise<{ data: TerminationRequest[] }> {
  return apiClient.get('/termination-requests');
}

export async function getTerminationRequest(id: string): Promise<{ data: TerminationRequest }> {
  return apiClient.get(`/termination-requests/${id}`);
}

export async function approveTermination(id: string): Promise<{ data: TerminationRequest }> {
  return apiClient.post(`/termination-requests/${id}/approve`);
}

export async function getClearanceChecklist(
  terminationId: string,
): Promise<{ data: ClearanceChecklist }> {
  return apiClient.get(`/clearance-checklist/${terminationId}`);
}

export interface UpdateClearanceItemData {
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

export async function updateClearanceItem(
  terminationId: string,
  department: string,
  data: UpdateClearanceItemData,
): Promise<{ data: ClearanceChecklist }> {
  return apiClient.put(`/clearance-checklist/${terminationId}/departments/${department}`, data);
}

export interface UpdateEquipmentReturnData {
  equipmentId: string;
  returned?: boolean;
  condition?: string;
}

export async function updateEquipmentReturn(
  terminationId: string,
  data: UpdateEquipmentReturnData,
): Promise<{ data: ClearanceChecklist }> {
  return apiClient.put(`/clearance-checklist/${terminationId}/equipment`, data);
}

export async function markCardReturned(
  terminationId: string,
): Promise<{ data: ClearanceChecklist }> {
  return apiClient.post(`/clearance-checklist/${terminationId}/card-returned`);
}

export async function getEmployeePerformanceData(
  employeeId: string,
): Promise<{ data: any }> {
  return apiClient.get(`/termination-requests/employee/${employeeId}/performance`);
}

export async function getEmployeeLeaveBalance(
  employeeId: string,
): Promise<{ data: any }> {
  return apiClient.get(`/termination-requests/employee/${employeeId}/leave-balance`);
}

// ==========================================
// CONSENT MANAGEMENT (REC-028)
// ==========================================

export async function withdrawConsent(applicationId: string, candidateId: string): Promise<{ data: { message: string } }> {
  return apiClient.post(`/applications/${applicationId}/withdraw-consent`, { candidateId });
}

export async function getConsentHistory(candidateId: string): Promise<{ data: any[] }> {
  return apiClient.get(`/candidates/${candidateId}/consent-history`);
}

// ==========================================
// EVALUATION CRITERIA (REC-020, REC-015)
// ==========================================

export async function getEvaluationCriteria(role: string, department?: string): Promise<{ data: { criteria: Array<{ name: string; weight: number; description?: string }> } }> {
  const params = new URLSearchParams({ role });
  if (department) params.append('department', department);
  return apiClient.get(`/evaluation-criteria?${params.toString()}`);
}
