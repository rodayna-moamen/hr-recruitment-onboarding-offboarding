import { Injectable } from '@nestjs/common';

@Injectable()
export class RecruitmentService {
  // Dummy data storage (in-memory for testing)
  private jobs = [
    {
      postingId: 'JP123',
      requisitionId: 'REQ001',
      templateId: 'TEMPL42',
      channel: 'external',
      status: 'published',
      orgStructureJobId: 'ORG-JOB-001', // Reference to Organizational Structure
      branding: {
        heroTitle: 'Join Our Team!',
        employerValueProps: ['Great culture', 'Health insurance'],
        mediaAssets: ['img1.jpg'],
        footerText: 'Be part of our success.'
      },
      previewUrl: 'https://careers.example.com/jobs/JP123',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000*60*60*24*30),
      seo: {
        slug: 'software-engineer',
        keywords: ['typescript','node.js','backend'],
        metaDescription: 'Hiring software engineers.'
      }
    },
    {
      postingId: 'JP124',
      requisitionId: 'REQ002',
      templateId: 'TEMPL43',
      channel: 'internal',
      status: 'draft',
      orgStructureJobId: 'ORG-JOB-002',
      branding: {
        heroTitle: 'Internal Opportunity',
        employerValueProps: ['Growth', 'Learning'],
        mediaAssets: [],
        footerText: 'Apply now.'
      },
      previewUrl: null,
      publishedAt: null,
      expiresAt: null,
      seo: {
        slug: 'hr-assistant',
        keywords: ['hr', 'recruitment'],
        metaDescription: 'HR Assistant position.'
      }
    }
  ];

  private applications = [
    {
      applicationId: 'APP001',
      candidateId: 'CAND001',
      requisitionId: 'REQ001',
      source: 'career-site',
      status: 'interview',
      currentStageId: 'STAGE003',
      progressPercent: 60,
      orgStructureJobId: 'ORG-JOB-001', // Reference
    }
  ];

  private candidates = [
    {
      candidateId: 'CAND001',
      personalInfo: {
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        email: 'ahmed@example.com'
      },
      referrals: [{
        referredByEmployeeId: 'EMP001' // Reference to Employee
      }]
    }
  ];

  private offers = [
    {
      offerId: 'OFF001',
      applicationId: 'APP001',
      status: 'sent',
      financialApprovalId: 'FIN-APP-001', // Reference to Financial Approval
      offerAcceptanceStatus: 'pending'
    }
  ];

  private interviews = [
    {
      interviewId: 'INT001',
      applicationId: 'APP001',
      status: 'scheduled',
      interviewPanelMemberIds: ['EMP001', 'EMP002'], // References to Employees
      calendarEventId: 'CAL-001' // Reference to Organizational Calendar
    }
  ];

  // Job Postings CRUD
  getAllJobs() {
    return this.jobs;
  }

  getJobById(postingId: string) {
    return this.jobs.find(job => job.postingId === postingId) || null;
  }

  createJob(jobData: any) {
    const newJob = { ...jobData, postingId: `JP${Date.now()}` };
    this.jobs.push(newJob);
    return newJob;
  }

  updateJob(postingId: string, jobData: any) {
    const index = this.jobs.findIndex(job => job.postingId === postingId);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...jobData };
      return this.jobs[index];
    }
    return null;
  }

  deleteJob(postingId: string) {
    const index = this.jobs.findIndex(job => job.postingId === postingId);
    if (index !== -1) {
      return this.jobs.splice(index, 1)[0];
    }
    return null;
  }

  // Applications CRUD
  getAllApplications() {
    return this.applications;
  }

  getApplicationById(applicationId: string) {
    return this.applications.find(app => app.applicationId === applicationId) || null;
  }

  createApplication(applicationData: any) {
    const newApp = { ...applicationData, applicationId: `APP${Date.now()}` };
    this.applications.push(newApp);
    return newApp;
  }

  // Candidates CRUD
  getAllCandidates() {
    return this.candidates;
  }

  getCandidateById(candidateId: string) {
    return this.candidates.find(cand => cand.candidateId === candidateId) || null;
  }

  createCandidate(candidateData: any) {
    const newCandidate = { ...candidateData, candidateId: `CAND${Date.now()}` };
    this.candidates.push(newCandidate);
    return newCandidate;
  }

  // Offers CRUD
  getAllOffers() {
    return this.offers;
  }

  getOfferById(offerId: string) {
    return this.offers.find(offer => offer.offerId === offerId) || null;
  }

  createOffer(offerData: any) {
    const newOffer = { ...offerData, offerId: `OFF${Date.now()}` };
    this.offers.push(newOffer);
    return newOffer;
  }

  // Interviews CRUD
  getAllInterviews() {
    return this.interviews;
  }

  getInterviewById(interviewId: string) {
    return this.interviews.find(int => int.interviewId === interviewId) || null;
  }

  createInterview(interviewData: any) {
    const newInterview = { ...interviewData, interviewId: `INT${Date.now()}` };
    this.interviews.push(newInterview);
    return newInterview;
  }
}

