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

export enum InterviewMethod {
  ONSITE = 'onsite',
  VIDEO = 'video',
  PHONE = 'phone',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type Interview = {
  _id: string;
  applicationId: string;
  stage: ApplicationStage;
  scheduledDate: string;
  method: InterviewMethod;
  panel: string[];
  calendarEventId?: string;
  videoLink?: string;
  status: InterviewStatus;
  feedbackId?: string;
  candidateFeedback?: string;
  createdAt?: string;
  updatedAt?: string;
};

export enum OfferResponseStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export enum OfferFinalStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export enum ApprovalStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export type OfferApprover = {
  employeeId: string;
  role: string;
  status: ApprovalStatus;
  actionDate: string;
  comment?: string;
};

export type Offer = {
  _id: string;
  applicationId: string;
  candidateId: string;
  hrEmployeeId?: string;
  grossSalary: number;
  signingBonus?: number;
  benefits?: string[];
  conditions?: string;
  insurances?: string;
  content: string;
  role: string;
  deadline: string;
  applicantResponse: OfferResponseStatus;
  approvers: OfferApprover[];
  finalStatus: OfferFinalStatus;
  candidateSignedAt?: string;
  hrSignedAt?: string;
  managerSignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Referral = {
  _id: string;
  referringEmployeeId: string;
  candidateId: string;
  role?: string;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AnalyticsData = {
  totalApplications: number;
  byStatus: Record<string, number>;
  byStage: Record<string, number>;
  averageTimeToHire: number;
  conversionRates: {
    screeningToInterview: number;
    interviewToOffer: number;
    offerToHired: number;
  };
  referralStats: {
    totalReferrals: number;
    referralPercentage: number;
  };
};