export type JobTemplate = {
  _id: string;
  title: string;
  department: string;
  qualifications?: string[];
  skills?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type JobRequisition = {
  _id: string;
  requisitionId: string;
  templateId?: string | JobTemplate;
  openings: number;
  location?: string;
  hiringManagerId: string;
  publishStatus?: 'draft' | 'published' | 'closed';
  postingDate?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export enum ApplicationStage {
  SCREENING = 'screening',
  DEPARTMENT_INTERVIEW = 'department_interview',
  HR_INTERVIEW = 'hr_interview',
  OFFER = 'offer',
}

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  IN_PROCESS = 'in_process',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

export type Application = {
  _id: string;
  candidateId: string;
  requisitionId: string | JobRequisition;
  assignedHr?: string;
  currentStage: ApplicationStage;
  status: ApplicationStatus;
  createdAt?: string;
  updatedAt?: string;
};
