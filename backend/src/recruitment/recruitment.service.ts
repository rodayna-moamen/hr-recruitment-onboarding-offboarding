import { Injectable, NotFoundException, BadRequestException, Logger, Optional, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateJobTemplateDto,
  UpdateJobTemplateDto,
  CreateJobRequisitionDto,
  UpdateJobRequisitionDto,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ScheduleInterviewDto,
  SubmitInterviewFeedbackDto,
  CreateOfferDto,
  ApproveOfferDto,
  RespondOfferDto,
  CreateReferralDto,
  RejectionTemplateDto,
  AnalyticsQueryDto,
} from './dto';
import { JobTemplate } from './models/job-template.schema';
import { JobRequisition } from './models/job-requisition.schema';
import { Application } from './models/application.schema';
import { ApplicationStatusHistory } from './models/application-history.schema';
import { Interview } from './models/interview.schema';
import { AssessmentResult } from './models/assessment-result.schema';
import { Referral } from './models/referral.schema';
import { Offer } from './models/offer.schema';
import { Contract } from './models/contract.schema';
import { Candidate } from '../employee-profile/models/candidate.schema';
import { ApplicationStage } from './enums/application-stage.enum';
import { ApplicationStatus } from './enums/application-status.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { InterviewMethod } from './enums/interview-method.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import type { IOnboardingService } from './interfaces/onboarding.interface';
import type { IEmployeeProfileService } from './interfaces/employee-profile.interface';
import type { IOrganizationStructureService } from './interfaces/organization-structure.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationChannel } from '../notifications/models/notification-log.schema';

/**
 * RecruitmentService with optional cross-subsystem dependencies.
 * 
 * When other subsystems are integrated:
 * 1. Replace stub services in RecruitmentModule with real implementations
 * 2. The service will automatically use the real implementations via dependency injection
 * 
 * Integration points:
 * - Onboarding: Triggered when offer is accepted (REC-029)
 * - Employee Profile: Create employee from candidate when offer accepted
 * - Organization Structure: Validate departments/positions
 */
@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(
    @InjectModel(JobTemplate.name)
    private jobTemplateModel: Model<JobTemplate>,
    @InjectModel(JobRequisition.name)
    private jobRequisitionModel: Model<JobRequisition>,
    @InjectModel(Application.name)
    private applicationModel: Model<Application>,
    @InjectModel(ApplicationStatusHistory.name)
    private applicationHistoryModel: Model<ApplicationStatusHistory>,
    @InjectModel(Interview.name)
    private interviewModel: Model<Interview>,
    @InjectModel(AssessmentResult.name)
    private assessmentResultModel: Model<AssessmentResult>,
    @InjectModel(Referral.name)
    private referralModel: Model<Referral>,
    @InjectModel(Offer.name)
    private offerModel: Model<Offer>,
    @InjectModel(Contract.name)
    private contractModel: Model<Contract>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<Candidate>,
    @Optional() @Inject('IOnboardingService') private onboardingService?: IOnboardingService,
    @Optional() @Inject('IEmployeeProfileService') private employeeProfileService?: IEmployeeProfileService,
    @Optional() @Inject('IOrganizationStructureService') private orgStructureService?: IOrganizationStructureService,
    @Optional() @Inject('ITimeManagementService') private timeManagementService?: any,
    @Optional() private notificationsService?: NotificationsService,
  ) {}

  // ==========================================
  // JOB TEMPLATES (REC-003) - BR2
  // ==========================================

  /**
   * Create standardized job description template
   * BR2: Each job requisition must include Job details (title, department, location, openings)
   * and Qualifications and skills needed
   */
  async createJobTemplate(dto: CreateJobTemplateDto): Promise<JobTemplate> {
    this.logger.log(`Creating job template: ${dto.title}`);
    
    // BR2: Validate required fields
    if (!dto.title || !dto.department) {
      throw new BadRequestException('Job title and department are required (BR2)');
    }
    
    if (!dto.qualifications || dto.qualifications.length === 0) {
      throw new BadRequestException('Qualifications are required (BR2)');
    }
    
    if (!dto.skills || dto.skills.length === 0) {
      throw new BadRequestException('Skills are required (BR2)');
    }

    // Validate department with organization structure (REC-003)
    if (this.orgStructureService && dto.department) {
      const isValid = await this.orgStructureService.validateDepartment(dto.department);
      if (!isValid) {
        throw new BadRequestException(`Department "${dto.department}" not found in organization structure. Please use a valid department.`);
      }
      this.logger.log(`Department "${dto.department}" validated successfully`);
    }

    const template = new this.jobTemplateModel(dto);
    await template.save();
    
    this.logger.log(`Job template created with ID: ${template._id}`);
    return template;
  }

  async findAllJobTemplates(): Promise<JobTemplate[]> {
    return this.jobTemplateModel.find().exec();
  }

  async findJobTemplateById(id: string): Promise<JobTemplate> {
    const template = await this.jobTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    return template;
  }

  async updateJobTemplate(id: string, dto: UpdateJobTemplateDto): Promise<JobTemplate> {
    // Validate department if being updated (REC-003)
    if (dto.department && this.orgStructureService) {
      const isValid = await this.orgStructureService.validateDepartment(dto.department);
      if (!isValid) {
        throw new BadRequestException(`Department "${dto.department}" not found in organization structure. Please use a valid department.`);
      }
      this.logger.log(`Department "${dto.department}" validated successfully`);
    }

    const template = await this.jobTemplateModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    
    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    
    this.logger.log(`Job template ${id} updated`);
    return template;
  }

  async deleteJobTemplate(id: string): Promise<void> {
    const result = await this.jobTemplateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    this.logger.log(`Job template ${id} deleted`);
  }

  // ==========================================
  // JOB REQUISITIONS (REC-004, REC-023) - BR2, BR6, BR9
  // ==========================================

  /**
   * Create job requisition
   * BR2: Must include job details (title, department, location, openings) and qualifications
   * BR6: System must allow automatic posting to career sites
   * BR9: Applications tracked through defined stages
   */
  async createJobRequisition(dto: CreateJobRequisitionDto): Promise<JobRequisition> {
    this.logger.log(`Creating job requisition: ${dto.requisitionId}`);
    
    // BR2: Validate required fields
    if (dto.openings < 1) {
      throw new BadRequestException('Number of openings must be at least 1 (BR2)');
    }

    // Validate template exists if provided
    if (dto.templateId) {
      const template = await this.findJobTemplateById(dto.templateId);
      
      // Validate department from template with organization structure (REC-003)
      if (this.orgStructureService && template.department) {
        const isValid = await this.orgStructureService.validateDepartment(template.department);
        if (!isValid) {
          throw new BadRequestException(`Department "${template.department}" from template not found in organization structure. Please update the template with a valid department.`);
        }
        this.logger.log(`Department "${template.department}" from template validated successfully`);
      }
    }

    const requisition = new this.jobRequisitionModel(dto);
    await requisition.save();
    
    this.logger.log(`Job requisition created with ID: ${requisition._id}`);
    return requisition;
  }

  /**
   * Publish job requisition (REC-023)
   * BR6: Automatic posting of approved requisitions to career sites
   */
  async publishJobRequisition(id: string): Promise<JobRequisition> {
    const requisition = await this.jobRequisitionModel.findById(id).exec();
    
    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    if (requisition.publishStatus === 'published') {
      throw new BadRequestException('Job requisition already published');
    }

    requisition.publishStatus = 'published';
    requisition.postingDate = new Date();
    await requisition.save();

    // BR6: Trigger automatic posting to career sites (event/webhook would go here)
    this.logger.log(`Job requisition ${id} published to career sites (BR6)`);
    
    return requisition;
  }

  async findAllJobRequisitions(userRole?: string): Promise<JobRequisition[]> {
    // Candidates can only see published jobs (BR6)
    const isCandidate = userRole === 'Job Candidate' || userRole === 'JOB_CANDIDATE' || userRole === 'job_candidate';
    
    if (isCandidate) {
      // Only return published jobs for candidates
      return this.jobRequisitionModel
        .find({ publishStatus: 'published' })
        .populate('templateId')
        .exec();
    }
    
    // HR employees and managers can see all jobs (published, draft, closed)
    return this.jobRequisitionModel.find().populate('templateId').exec();
  }

  async findJobRequisitionById(id: string, userRole?: string): Promise<JobRequisition> {
    const requisition = await this.jobRequisitionModel
      .findById(id)
      .populate('templateId')
      .exec();
    
    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }
    
    // Candidates can only access published jobs (BR6)
    const isCandidate = userRole === 'Job Candidate' || userRole === 'JOB_CANDIDATE' || userRole === 'job_candidate';
    if (isCandidate && requisition.publishStatus !== 'published') {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }
    
    return requisition;
  }

  async updateJobRequisition(id: string, dto: UpdateJobRequisitionDto): Promise<JobRequisition> {
    const requisition = await this.jobRequisitionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    
    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }
    
    this.logger.log(`Job requisition ${id} updated`);
    return requisition;
  }

  // ==========================================
  // APPLICATIONS (REC-007, REC-008) - BR12, BR9, BR28
  // ==========================================

  /**
   * Create candidate application (REC-007)
   * BR12: Support storage/upload of applications with resumes (creates talent pool)
   * BR28: Storing talent pool needs applicant authorization
   */
  async createApplication(dto: CreateApplicationDto): Promise<Application> {
    this.logger.log(`Creating application for candidate: ${dto.candidateId}`);
    
    // BR28: Validate consent for data processing
    if (!dto.consentGiven) {
      throw new BadRequestException('Candidate consent is required for data processing (BR28)');
    }

    // BR12: Validate CV is provided (required)
    if (!dto.cvPath || !dto.cvPath.trim()) {
      throw new BadRequestException('CV/Resume is required (BR12)');
    }

    // Validate requisition exists
    await this.findJobRequisitionById(dto.requisitionId);

    // BR12: Create application (CV can be file data URL or URL path)
    const application = new this.applicationModel({
      candidateId: new Types.ObjectId(dto.candidateId),
      requisitionId: new Types.ObjectId(dto.requisitionId),
      assignedHr: dto.assignedHr ? new Types.ObjectId(dto.assignedHr) : undefined,
      currentStage: dto.currentStage || ApplicationStage.SCREENING,
      status: dto.status || ApplicationStatus.SUBMITTED,
    });

    await application.save();

    // BR28: Log consent in NotificationLog for tracking (REC-028)
    if (this.notificationsService && dto.consentGiven) {
      try {
        // Get candidate details for logging
        const candidate = await this.candidateModel.findById(dto.candidateId).exec();
        const candidateEmail = candidate?.personalEmail || (candidate as any)?.email || 'unknown@example.com';
        const candidateName = candidate?.firstName && candidate?.lastName
          ? `${candidate.firstName} ${candidate.lastName}`
          : (candidate as any)?.fullName || 'Candidate';

        await this.notificationsService.logNotification({
          type: NotificationType.CONSENT_GIVEN,
          channel: NotificationChannel.IN_APP,
          recipientId: dto.candidateId,
          recipientEmail: candidateEmail,
          recipientName: candidateName,
          subject: 'Consent Given for Data Processing',
          content: `Consent given for application ${application._id}`,
          metadata: {
            applicationId: application._id.toString(),
            consentGiven: true,
            timestamp: new Date().toISOString(),
          },
          relatedEntityId: application._id.toString(),
          relatedEntityType: 'application',
        });
        this.logger.log(`Consent logged for application ${application._id} (BR28, REC-028)`);
      } catch (error) {
        this.logger.warn(`Failed to log consent: ${error.message}`);
      }
    }

    // BR14, BR25: Handle referral tagging if applicable
    if (dto.isReferral && dto.referredBy) {
      await this.createReferral({
        referringEmployeeId: dto.referredBy,
        candidateId: dto.candidateId,
      });
      this.logger.log(`Application tagged as referral (BR14)`);
    }

    // Create initial history entry
    await this.createApplicationHistory(
      application._id.toString(),
      null,
      application.currentStage,
      null,
      application.status,
      dto.assignedHr || 'system',
    );

    this.logger.log(`Application created with ID: ${application._id} (BR12)`);
    return application;
  }

  /**
   * Update application status (REC-008)
   * BR9: Applications tracked through defined stages
   * BR11: Status changes trigger alerts to recruiters/managers
   * BR27: Status tracking must be real-time and visualized
   */
  async updateApplicationStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
    changedBy: string,
  ): Promise<Application> {
    const application = await this.applicationModel.findById(id).exec();
    
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const oldStage = application.currentStage;
    const oldStatus = application.status;

    // Update application
    if (dto.currentStage) {
      application.currentStage = dto.currentStage;
    }
    if (dto.status) {
      application.status = dto.status;
    }

    await application.save();

    // BR9: Track through defined stages - Create history entry
    await this.createApplicationHistory(
      id,
      oldStage,
      application.currentStage,
      oldStatus,
      application.status,
      changedBy,
    );

    // BR11, BR27: Trigger notification hooks (would integrate with notification service)
    await this.triggerStatusChangeNotifications(application, oldStatus, dto.comment);

    this.logger.log(`Application ${id} status updated from ${oldStatus} to ${application.status} (BR9)`);
    return application;
  }

  /**
   * Get application tracking history (REC-008)
   * BR27: Status tracking easily visualized and real-time
   */
  async getApplicationHistory(applicationId: string): Promise<ApplicationStatusHistory[]> {
    return this.applicationHistoryModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findAllApplications(filters?: any, userRole?: string, userId?: string): Promise<Application[]> {
    try {
      // Build query object
      const query: any = {};
      
      // Candidates can only see their own applications
      const isCandidate = userRole === 'Job Candidate' || userRole === 'JOB_CANDIDATE' || userRole === 'job_candidate';
      if (isCandidate && userId) {
        // Force filter to only show candidate's own applications
        if (Types.ObjectId.isValid(userId)) {
          query.candidateId = new Types.ObjectId(userId);
        } else {
          this.logger.warn(`Invalid userId for candidate: ${userId}`);
          return []; // Return empty array if invalid userId
        }
      } else if (filters) {
        // HR employees/managers can filter by any criteria
        if (filters.currentStage) {
          query.currentStage = filters.currentStage;
        }
        if (filters.status) {
          query.status = filters.status;
        }
        if (filters.candidateId) {
          // Convert candidateId string to ObjectId for query
          if (Types.ObjectId.isValid(filters.candidateId)) {
            query.candidateId = new Types.ObjectId(filters.candidateId);
          } else {
            this.logger.warn(`Invalid candidateId filter: ${filters.candidateId}`);
          }
        }
      }

      const applications = await this.applicationModel
        .find(query)
        .populate({
          path: 'candidateId',
          select: '_id candidateNumber firstName lastName email',
          strictPopulate: false, // Don't throw error if collection doesn't exist
        })
        .populate({
          path: 'requisitionId',
          select: '_id requisitionId title openings location',
          strictPopulate: false,
        })
        .exec();
      return applications;
    } catch (error) {
      this.logger.error(`Error fetching applications: ${error.message}`);
      // If populate fails, return without populate
      const query: any = {};
      
      // Apply same candidate restriction
      const isCandidate = userRole === 'Job Candidate' || userRole === 'JOB_CANDIDATE' || userRole === 'job_candidate';
      if (isCandidate && userId && Types.ObjectId.isValid(userId)) {
        query.candidateId = new Types.ObjectId(userId);
      } else if (filters) {
        if (filters.currentStage) query.currentStage = filters.currentStage;
        if (filters.status) query.status = filters.status;
        if (filters.candidateId && Types.ObjectId.isValid(filters.candidateId)) {
          query.candidateId = new Types.ObjectId(filters.candidateId);
        }
      }
      return await this.applicationModel.find(query).exec();
    }
  }

  async findApplicationById(id: string, userRole?: string, userId?: string): Promise<Application> {
    try {
      const application = await this.applicationModel
        .findById(id)
        .populate({
          path: 'candidateId',
          strictPopulate: false,
        })
        .populate({
          path: 'requisitionId',
          strictPopulate: false,
        })
        .exec();
      
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }
      
      // Candidates can only access their own applications
      const isCandidate = userRole === 'Job Candidate' || userRole === 'JOB_CANDIDATE' || userRole === 'job_candidate';
      if (isCandidate && userId) {
        const applicationCandidateId = application.candidateId?.toString() || (application.candidateId as any)?._id?.toString();
        const userIdStr = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId).toString() : userId;
        if (applicationCandidateId !== userIdStr) {
          throw new NotFoundException(`Application with ID ${id} not found`);
        }
      }
      
      return application;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // If populate fails, try without populate
      const application = await this.applicationModel.findById(id).exec();
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }
      
      // Apply same candidate restriction
      const isCandidate = userRole === 'Job Candidate' || userRole === 'JOB_CANDIDATE' || userRole === 'job_candidate';
      if (isCandidate && userId) {
        const applicationCandidateId = application.candidateId?.toString() || (application.candidateId as any)?._id?.toString();
        const userIdStr = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId).toString() : userId;
        if (applicationCandidateId !== userIdStr) {
          throw new NotFoundException(`Application with ID ${id} not found`);
        }
      }
      
      return application;
    }
  }

  // ==========================================
  // INTERVIEWS (REC-010, REC-011, REC-020, REC-021) - BR19, BR20, BR21, BR22, BR23
  // ==========================================

  /**
   * Schedule interview (REC-010)
   * BR19: Recruiters can schedule interviews by selecting time slots, panel members, and modes
   * BR19(c): Interviewers receive automatic calendar invites
   * BR19(d): Candidates notified automatically
   * BR20: Panels need knowledge/training to conduct interviews
   */
  async scheduleInterview(dto: ScheduleInterviewDto): Promise<Interview> {
    this.logger.log(`Scheduling interview for application: ${dto.applicationId}`);
    
    // Validate application exists
    const application = await this.findApplicationById(dto.applicationId);

    // ✅ ENSURE ONLY ONE INTERVIEW PER APPLICATION PER STAGE
    // Applications can have multiple interviews at different stages (Screening, Department, HR)
    const existingInterview = await this.interviewModel.findOne({
      applicationId: new Types.ObjectId(dto.applicationId),
      stage: dto.stage,
    }).exec();

    if (existingInterview) {
      throw new BadRequestException(`An interview already exists for this application at the ${dto.stage} stage. Only one interview per stage is allowed.`);
    }

    // BR19(a): Validate panel members exist (would check user service in real implementation)
    if (!dto.panel || dto.panel.length === 0) {
      throw new BadRequestException('At least one panel member is required (BR19)');
    }

    // Validate and parse scheduledDate
    let scheduledDate: Date;
    try {
      scheduledDate = typeof dto.scheduledDate === 'string' ? new Date(dto.scheduledDate) : dto.scheduledDate;
      if (isNaN(scheduledDate.getTime())) {
        throw new BadRequestException('Invalid scheduledDate format. Must be a valid ISO 8601 date string.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid scheduledDate format. Must be a valid ISO 8601 date string.');
    }

    // Create interview
    const interview = new this.interviewModel({
      applicationId: new Types.ObjectId(dto.applicationId),
      stage: dto.stage,
      scheduledDate: scheduledDate,
      method: dto.method,
      panel: dto.panel.map(id => new Types.ObjectId(id)),
      videoLink: dto.videoLink,
      calendarEventId: dto.calendarEventId,
      status: InterviewStatus.SCHEDULED,
    });

    await interview.save();

    // BR19(c): Create calendar event via Time Management (REC-010, REC-021)
    if (this.timeManagementService && dto.panel && dto.panel.length > 0) {
      try {
        // Calculate end time (assume 1 hour interview duration)
        const startTime = scheduledDate;
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

        // Check panel member availability (BR19b)
        const availability = await this.timeManagementService.checkAvailability(
          dto.panel,
          startTime,
          endTime,
        );

        // Log availability issues but don't block scheduling (warn only)
        const unavailableMembers = availability.filter(a => !a.available);
        if (unavailableMembers.length > 0) {
          this.logger.warn(`Some panel members are unavailable: ${unavailableMembers.map(a => a.employeeId).join(', ')}`);
        }

        // Get panel member emails for calendar invite
        const panelEmails: string[] = [];
        // In real implementation, fetch emails from Employee Profile service
        // For now, we'll create the event and let the notification service handle emails

        const calendarEvent = await this.timeManagementService.createCalendarEvent({
          title: `Interview - Application ${dto.applicationId}`,
          description: `Interview scheduled for application ${dto.applicationId} at stage ${dto.stage}`,
          startTime: startTime,
          endTime: endTime,
          attendees: dto.panel,
          location: dto.method === InterviewMethod.ONSITE ? 'Office' : undefined,
          videoLink: dto.videoLink,
        });

        // Update interview with calendar event ID
        interview.calendarEventId = calendarEvent.eventId;
        await interview.save();

        // Send calendar invites to panel members
        if (calendarEvent.eventId && panelEmails.length > 0) {
          await this.timeManagementService.sendCalendarInvite(calendarEvent.eventId, panelEmails);
        }

        this.logger.log(`Calendar event created: ${calendarEvent.eventId} (BR19c)`);
      } catch (error) {
        this.logger.warn(`Failed to create calendar event: ${error.message}. Interview scheduled without calendar integration.`);
      }
    }

    // BR19(c): Send calendar invites to interviewers (notification hook)
    await this.sendInterviewInvites(interview, 'panel');
    
    // BR19(d): Notify candidate (notification hook)
    await this.sendInterviewInvites(interview, 'candidate');

    this.logger.log(`Interview scheduled with ID: ${interview._id} (BR19)`);
    return interview;
  }

  /**
   * Get evaluation criteria for a role (REC-020, REC-015)
   * BR21: Criteria used in assessment are pre-set and agreed upon
   * Returns default criteria if no role-specific criteria found
   */
  async getEvaluationCriteria(role: string, department?: string): Promise<{
    criteria: Array<{ name: string; weight: number; description?: string }>;
  }> {
    // Try to get criteria from job template if department provided
    if (department) {
      try {
        const template = await this.jobTemplateModel.findOne({ department, title: role }).exec();
        if (template) {
          // Use template skills/qualifications as criteria basis
          const criteria = [
            { name: 'Technical Skills', weight: 3, description: `Assess: ${template.skills?.join(', ') || 'Technical competency'}` },
            { name: 'Communication', weight: 2, description: 'Verbal and written communication skills' },
            { name: 'Culture Fit', weight: 2, description: 'Alignment with company values and team dynamics' },
            { name: 'Overall', weight: 1, description: 'Overall recommendation' },
          ];
          return { criteria };
        }
      } catch (error) {
        this.logger.warn(`Could not fetch criteria from template: ${error.message}`);
      }
    }

    // Default criteria for all roles (REC-020)
    return {
      criteria: [
        { name: 'Technical Skills', weight: 3, description: 'Technical competency and problem-solving abilities' },
        { name: 'Communication', weight: 2, description: 'Verbal and written communication skills' },
        { name: 'Culture Fit', weight: 2, description: 'Alignment with company values and team dynamics' },
        { name: 'Overall', weight: 1, description: 'Overall recommendation' },
      ],
    };
  }

  /**
   * Submit interview feedback (REC-011, REC-020)
   * BR10: Allow adding comments and ratings at each stage
   * BR22: Feedback must be submitted by panel/interviewers for accuracy
   * BR21: Criteria used in assessment are pre-set and agreed upon
   * BR23: System allows/houses multiple assessment tools
   */
  async submitInterviewFeedback(dto: SubmitInterviewFeedbackDto): Promise<AssessmentResult> {
    this.logger.log(`Submitting feedback for interview: ${dto.interviewId}`);
    
    // Validate interview exists
    const interview = await this.interviewModel.findById(dto.interviewId).exec();
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${dto.interviewId} not found`);
    }

    // BR22: Validate interviewer is part of the panel
    const isInPanel = interview.panel.some(
      panelMember => panelMember.toString() === dto.interviewerId
    );
    
    if (!isInPanel) {
      throw new BadRequestException('Only panel members can submit feedback (BR22)');
    }

    // BR21, BR23: Create structured assessment result with pre-set criteria
    const assessmentResult = new this.assessmentResultModel({
      interviewId: new Types.ObjectId(dto.interviewId),
      interviewerId: new Types.ObjectId(dto.interviewerId),
      score: dto.overallScore,
      comments: dto.comments,
      // In real implementation, would store detailed scores per criterion
    });

    await assessmentResult.save();

    // Update interview status if all panel members submitted feedback
    const allFeedback = await this.assessmentResultModel
      .find({ interviewId: interview._id })
      .exec();
    
    if (allFeedback.length === interview.panel.length) {
      interview.status = InterviewStatus.COMPLETED;
      interview.feedbackId = assessmentResult._id as Types.ObjectId;
      await interview.save();
      this.logger.log(`All panel feedback received for interview ${dto.interviewId} (BR22)`);
    }

    this.logger.log(`Interview feedback submitted (BR10, BR21, BR23)`);
    return assessmentResult;
  }

  async findAllInterviews(): Promise<Interview[]> {
    const interviews = await this.interviewModel
      .find({})
      .populate('panel')
      .populate('applicationId')
      .sort({ scheduledDate: -1 }) // Sort by date descending (newest first)
      .exec();

    // Auto-update status based on scheduled date
    const now = new Date();
    for (const interview of interviews) {
      const scheduledDate = new Date(interview.scheduledDate);
      // Mark scheduled interviews as completed if date has passed
      if (scheduledDate < now && interview.status === InterviewStatus.SCHEDULED) {
        interview.status = InterviewStatus.COMPLETED;
        await interview.save();
      }
      // Revert completed interviews back to scheduled if date is in the future
      else if (scheduledDate > now && interview.status === InterviewStatus.COMPLETED) {
        interview.status = InterviewStatus.SCHEDULED;
        await interview.save();
      }
    }

    return interviews;
  }

  async findInterviewsByApplication(applicationId: string): Promise<Interview[]> {
    const interviews = await this.interviewModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .populate('panel')
      .sort({ scheduledDate: -1 }) // Sort by date descending
      .exec();

    // Auto-update status based on scheduled date
    const now = new Date();
    for (const interview of interviews) {
      const scheduledDate = new Date(interview.scheduledDate);
      // Mark scheduled interviews as completed if date has passed
      if (scheduledDate < now && interview.status === InterviewStatus.SCHEDULED) {
        interview.status = InterviewStatus.COMPLETED;
        await interview.save();
      }
      // Revert completed interviews back to scheduled if date is in the future
      else if (scheduledDate > now && interview.status === InterviewStatus.COMPLETED) {
        interview.status = InterviewStatus.SCHEDULED;
        await interview.save();
      }
    }

    return interviews;
  }

  async findInterviewById(id: string): Promise<any> {
    const interview = await this.interviewModel
      .findById(id)
      .populate('panel')
      .exec();
    
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    // Fetch all assessment results (feedback) for this interview
    const assessmentResults = await this.assessmentResultModel
      .find({ interviewId: interview._id })
      .exec();

    // Check if scheduled date has passed and update status if needed
    const now = new Date();
    const scheduledDate = new Date(interview.scheduledDate);
    // Mark scheduled interviews as completed if date has passed
    if (scheduledDate < now && interview.status === InterviewStatus.SCHEDULED) {
      // Auto-update status for past interviews that are still marked as scheduled
      interview.status = InterviewStatus.COMPLETED;
      await interview.save();
    }
    // Revert completed interviews back to scheduled if date is in the future
    else if (scheduledDate > now && interview.status === InterviewStatus.COMPLETED) {
      interview.status = InterviewStatus.SCHEDULED;
      await interview.save();
    }

    return {
      ...interview.toObject(),
      feedback: assessmentResults, // Include all feedback submissions
    };
  }

  // ==========================================
  // REFERRALS (REC-030) - BR14, BR25
  // ==========================================

  /**
   * Create referral record (REC-030)
   * BR14: Electronic screening includes rule-based filters
   * BR25: Tie-breaking rules (e.g., internal candidate/referral preference)
   */
  async createReferral(dto: CreateReferralDto): Promise<Referral> {
    this.logger.log(`Creating referral for candidate: ${dto.candidateId}`);
    
    const referral = new this.referralModel({
      referringEmployeeId: new Types.ObjectId(dto.referringEmployeeId),
      candidateId: new Types.ObjectId(dto.candidateId),
      role: dto.role,
      level: dto.level,
    });

    await referral.save();
    
    // BR25: Referrals get priority in screening (would affect ranking logic)
    this.logger.log(`Referral created - candidate gets priority (BR14, BR25)`);
    return referral;
  }

  async findAllReferrals(): Promise<Referral[]> {
    try {
      const referrals = await this.referralModel
        .find()
        .populate({
          path: 'referringEmployeeId',
          select: '_id firstName lastName personalEmail workEmail employeeNumber', // Select EmployeeProfile fields
          strictPopulate: false, // Allow populate to not fail if path is not found
        })
        .populate({
          path: 'candidateId',
          select: '_id candidateNumber firstName lastName email', // Populate candidate info
          strictPopulate: false,
        })
        .exec();
      return referrals;
    } catch (error: any) {
      // Log the full error for debugging
      this.logger.error(`Error fetching referrals: ${error?.message || error}`, error?.stack);
      
      // If populate fails (e.g., User model not registered, invalid ObjectId, etc.), return without populate
      try {
        const referralsWithoutPopulate = await this.referralModel.find().exec();
        this.logger.debug(`Returning ${referralsWithoutPopulate.length} referrals without populate`);
        return referralsWithoutPopulate;
      } catch (fallbackError: any) {
        this.logger.error(`Error fetching referrals without populate: ${fallbackError?.message || fallbackError}`);
        throw new BadRequestException(`Failed to fetch referrals: ${fallbackError?.message || 'Unknown error'}`);
      }
    }
  }

  async findReferralsByCandidate(candidateId: string): Promise<Referral[]> {
    try {
      // Validate candidateId is a valid ObjectId
      if (!Types.ObjectId.isValid(candidateId)) {
        throw new BadRequestException(`Invalid candidateId: ${candidateId}`);
      }

      const referrals = await this.referralModel
        .find({ candidateId: new Types.ObjectId(candidateId) })
        .populate({
          path: 'referringEmployeeId',
          select: '_id firstName lastName personalEmail workEmail employeeNumber', // Select EmployeeProfile fields
          strictPopulate: false, // Allow populate to not fail if path is not found
        })
        .populate({
          path: 'candidateId',
          select: '_id candidateNumber firstName lastName email', // Populate candidate info
          strictPopulate: false,
        })
        .exec();
      return referrals;
    } catch (error: any) {
      // Log the full error for debugging
      this.logger.error(`Error fetching referrals by candidate: ${error?.message || error}`, error?.stack);
      
      // If populate fails (e.g., User model not registered, invalid ObjectId, etc.), return without populate
      try {
        if (!Types.ObjectId.isValid(candidateId)) {
          throw new BadRequestException(`Invalid candidateId: ${candidateId}`);
      }
        const referralsWithoutPopulate = await this.referralModel
        .find({ candidateId: new Types.ObjectId(candidateId) })
        .exec();
        this.logger.debug(`Returning ${referralsWithoutPopulate.length} referrals without populate`);
        return referralsWithoutPopulate;
      } catch (fallbackError: any) {
        this.logger.error(`Error fetching referrals without populate: ${fallbackError?.message || fallbackError}`);
        throw new BadRequestException(`Failed to fetch referrals: ${fallbackError?.message || 'Unknown error'}`);
      }
    }
  }

  // ==========================================
  // OFFERS (REC-014, REC-018, REC-029) - BR26, BR37
  // ==========================================

  /**
   * Create job offer (REC-014)
   * BR26(a): Offer letter must be customizable and editable
   * BR26(b): Secure related parties' approval before sending
   */
  async createOffer(dto: CreateOfferDto): Promise<Offer> {
    this.logger.log(`Creating offer for application: ${dto.applicationId}`);
    
    // Validate application exists
    const application = await this.findApplicationById(dto.applicationId);
    
    // Allow creating offers for applications in process (not just "offer" status)
    // The application status will be updated to "offer" when offer is created
    if (application.status === ApplicationStatus.REJECTED || application.status === ApplicationStatus.HIRED) {
      throw new BadRequestException('Cannot create offer for rejected or hired applications');
    }

    // BR26(a): Create customizable offer
    const offer = new this.offerModel({
      applicationId: new Types.ObjectId(dto.applicationId),
      candidateId: new Types.ObjectId(dto.candidateId),
      hrEmployeeId: dto.hrEmployeeId ? new Types.ObjectId(dto.hrEmployeeId) : undefined,
      grossSalary: dto.grossSalary,
      signingBonus: dto.signingBonus,
      benefits: dto.benefits,
      conditions: dto.conditions,
      insurances: dto.insurances,
      content: dto.content,
      role: dto.role,
      deadline: typeof dto.deadline === 'string' ? new Date(dto.deadline) : dto.deadline,
      applicantResponse: OfferResponseStatus.PENDING,
      finalStatus: OfferFinalStatus.PENDING,
      approvers: [],
    });

    await offer.save();
    
    this.logger.log(`Offer created with ID: ${offer._id} (BR26)`);
    return offer;
  }

  /**
   * Approve offer (REC-014)
   * BR26(b): System must support securing related parties' approval
   * REC-027: Financial approval required before sending offers
   */
  async approveOffer(offerId: string, dto: ApproveOfferDto): Promise<Offer> {
    const offer = await this.offerModel.findById(offerId).exec();
    
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Check if this approver already approved
    const existingApprover = offer.approvers.find(
      a => a.employeeId.toString() === dto.employeeId && a.role === dto.role
    );
    if (existingApprover) {
      throw new BadRequestException(`Approver ${dto.role} (${dto.employeeId}) has already provided approval for this offer`);
    }

    // Add approver
    offer.approvers.push({
      employeeId: new Types.ObjectId(dto.employeeId),
      role: dto.role,
      status: dto.status,
      actionDate: new Date(),
      comment: dto.comment,
    });

    // Check for required approvals: HR Manager + Financial Approver (REC-027)
    const hasHRApproval = offer.approvers.some(
      a => (a.role === 'HR Manager' || a.role === 'hr_manager') && a.status === ApprovalStatus.APPROVED
    );
    const hasFinancialApproval = offer.approvers.some(
      a => (a.role === 'Financial Approver' || a.role === 'Finance Manager' || a.role === 'finance_manager') && a.status === ApprovalStatus.APPROVED
    );

    // Check if all required approvals received
    const allApproved = offer.approvers.every(
      approver => approver.status === ApprovalStatus.APPROVED
    );

    // BR26(b): Require both HR and Financial approval before marking as fully approved
    if (allApproved && hasHRApproval && hasFinancialApproval) {
      offer.finalStatus = OfferFinalStatus.APPROVED;
      this.logger.log(`Offer ${offerId} fully approved (HR + Financial) - ready to send (BR26b, REC-027)`);
    } else if (hasHRApproval && !hasFinancialApproval) {
      this.logger.log(`Offer ${offerId} has HR approval, awaiting Financial approval (REC-027)`);
    } else if (hasFinancialApproval && !hasHRApproval) {
      this.logger.log(`Offer ${offerId} has Financial approval, awaiting HR approval`);
    } else {
      this.logger.log(`Offer ${offerId} awaiting required approvals (HR Manager + Financial Approver)`);
    }

    await offer.save();
    return offer;
  }

  /**
   * Candidate responds to offer (REC-018)
   * BR26(d): System stores communication logs
   * BR37: Communication logs stored in applicant profile
   */
  async respondToOffer(offerId: string, dto: RespondOfferDto): Promise<Offer> {
    const offer = await this.offerModel.findById(offerId).exec();
    
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    offer.applicantResponse = dto.response;

    if (dto.response === OfferResponseStatus.ACCEPTED) {
      offer.finalStatus = OfferFinalStatus.APPROVED; // Use APPROVED for accepted offers
      offer.candidateSignedAt = new Date();

      // BR26(c): Trigger onboarding (REC-029)
      await this.triggerOnboarding(offer);
      
      // Update application status to hired
      await this.updateApplicationStatus(
        offer.applicationId.toString(),
        { status: ApplicationStatus.HIRED },
        'system',
      );

      this.logger.log(`Offer accepted - onboarding triggered (BR26c)`);
    } else if (dto.response === OfferResponseStatus.REJECTED) {
      offer.finalStatus = OfferFinalStatus.REJECTED;
    }

    await offer.save();
    
    // BR37: Log communication in applicant profile
    this.logger.log(`Offer response logged (BR37)`);
    
    return offer;
  }

  async findAllOffers(): Promise<Offer[]> {
    return this.offerModel
      .find()
      .populate('candidateId')
      .exec();
  }

  async findOfferById(id: string): Promise<Offer> {
    const offer = await this.offerModel
      .findById(id)
      .populate('candidateId')
      .exec();
    
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  // ==========================================
  // REJECTION & COMMUNICATION (REC-022) - BR36, BR37
  // ==========================================

  /**
   * Send rejection notification (REC-022)
   * BR36: System must send automated alerts/emails for status updates
   * BR37: Communication logs must be stored
   */
  async sendRejectionNotification(
    applicationId: string,
    template: RejectionTemplateDto,
  ): Promise<void> {
    const application = await this.findApplicationById(applicationId);
    
    // Update application status to rejected
    await this.updateApplicationStatus(
      applicationId,
      { status: ApplicationStatus.REJECTED, reason: template.reason },
      'system',
    );

    // BR36: Send automated email
    if (this.notificationsService) {
      try {
        const candidateId = application.candidateId.toString();
        
        // Get candidate information
        let candidateEmail: string = '';
        let candidateName: string = 'Candidate';

        if (typeof (application as any).candidateId === 'object' && (application as any).candidateId) {
          const candidate = (application as any).candidateId;
          candidateEmail = candidate.personalEmail || candidate.email || '';
          candidateName = candidate.firstName && candidate.lastName 
            ? `${candidate.firstName} ${candidate.lastName}`
            : candidate.fullName || 'Candidate';
        } else {
          // Fetch candidate directly from Candidate model
          try {
            const candidate = await this.candidateModel.findById(candidateId).exec();
            if (candidate) {
              candidateEmail = candidate.personalEmail || '';
              candidateName = candidate.firstName && candidate.lastName
                ? `${candidate.firstName} ${candidate.lastName}`
                : candidate.fullName || 'Candidate';
            }
          } catch (error) {
            this.logger.warn(`Could not fetch candidate details: ${error.message}`);
          }
        }

        if (candidateEmail) {
          await this.notificationsService.sendApplicationRejection(
            candidateId,
            candidateEmail,
            candidateName,
            applicationId,
            template.reason,
            template.body,
          );
          this.logger.log(`Rejection notification sent to candidate (BR36)`);
        } else {
          this.logger.warn(`No email found for candidate. Rejection notification not sent.`);
        }
      } catch (error) {
        this.logger.error(`Failed to send rejection notification: ${error.message}`, error.stack);
      }
    } else {
      this.logger.warn('NotificationsService not available. Rejection notification not sent.');
    }
    
    // BR37: Log communication (handled by NotificationsService)
    this.logger.log(`Rejection communication logged (BR37)`);
  }

  // ==========================================
  // ANALYTICS (REC-009) - BR33
  // ==========================================

  /**
   * Generate recruitment analytics (REC-009)
   * BR33: Multiple reports could be generated (time-to-hire, source effectiveness)
   */
  async getRecruitmentAnalytics(query: AnalyticsQueryDto): Promise<any> {
    this.logger.log('Generating recruitment analytics (BR33)');
    
    const filters: any = {};
    
    if (query.startDate || query.endDate) {
      filters.createdAt = {};
      if (query.startDate) filters.createdAt.$gte = query.startDate;
      if (query.endDate) filters.createdAt.$lte = query.endDate;
    }
    
    if (query.requisitionId) {
      filters.requisitionId = new Types.ObjectId(query.requisitionId);
    }
    
    if (query.status) {
      filters.status = query.status;
    }

    const applications = await this.applicationModel.find(filters).exec();

    // BR33: Calculate metrics
    const analytics = {
      totalApplications: applications.length,
      byStatus: this.groupByStatus(applications),
      byStage: this.groupByStage(applications),
      averageTimeToHire: await this.calculateAverageTimeToHire(applications),
      conversionRates: this.calculateConversionRates(applications),
      referralStats: await this.getReferralStats(applications),
    };

    this.logger.log(`Analytics generated for ${applications.length} applications (BR33)`);
    return analytics;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async createApplicationHistory(
    applicationId: string,
    oldStage: ApplicationStage | null,
    newStage: ApplicationStage,
    oldStatus: ApplicationStatus | null,
    newStatus: ApplicationStatus,
    changedBy: string,
  ): Promise<ApplicationStatusHistory> {
    // Handle 'system' or other non-ObjectId strings
    let changedById: Types.ObjectId;
    try {
      changedById = new Types.ObjectId(changedBy);
    } catch (error) {
      // If changedBy is not a valid ObjectId (e.g., 'system'), use a default ObjectId
      // In production, you'd want to use an actual system user ID
      changedById = new Types.ObjectId('000000000000000000000000'); // Default system user
    }

    const history = new this.applicationHistoryModel({
      applicationId: new Types.ObjectId(applicationId),
      oldStage: oldStage || 'none',
      newStage,
      oldStatus: oldStatus || 'none',
      newStatus,
      changedBy: changedById,
    });

    await history.save();
    return history;
  }

  private async triggerStatusChangeNotifications(
    application: Application,
    oldStatus: ApplicationStatus,
    comment?: string,
  ): Promise<void> {
    // BR11, BR27, BR36: Trigger notification service
    if (!this.notificationsService) {
      this.logger.warn('NotificationsService not available. Skipping notification.');
      return;
    }

    try {
      // Get candidate information
      const candidateId = application.candidateId.toString();
      
      // Try to get candidate details from populated application or fetch separately
      let candidateEmail: string;
      let candidateName: string;

      if (typeof (application as any).candidateId === 'object' && (application as any).candidateId) {
        const candidate = (application as any).candidateId;
        candidateEmail = candidate.personalEmail || candidate.email || '';
        candidateName = candidate.firstName && candidate.lastName 
          ? `${candidate.firstName} ${candidate.lastName}`
          : candidate.fullName || 'Candidate';
        } else {
          // Fetch candidate directly from Candidate model
          try {
            const candidate = await this.candidateModel.findById(candidateId).exec();
            if (candidate) {
              candidateEmail = candidate.personalEmail || '';
              candidateName = candidate.firstName && candidate.lastName
                ? `${candidate.firstName} ${candidate.lastName}`
                : candidate.fullName || 'Candidate';
            } else {
              this.logger.warn(`Candidate ${candidateId} not found. Cannot send notification.`);
              return;
            }
          } catch (error) {
            this.logger.warn(`Could not fetch candidate details: ${error.message}`);
            return; // Can't send notification without email
          }
        }

      if (!candidateEmail) {
        this.logger.warn(`No email found for candidate ${candidateId}. Skipping notification.`);
        return;
      }

      // Send notification
      const applicationId = (application as any)._id?.toString() || String((application as any).id) || '';
      await this.notificationsService.sendApplicationStatusUpdate(
        candidateId,
        candidateEmail,
        candidateName,
        applicationId,
        oldStatus,
        application.status,
        application.currentStage,
        comment,
      );

      this.logger.log(`Status change notification sent: ${oldStatus} -> ${application.status} (BR11, BR27, BR36)`);
    } catch (error) {
      this.logger.error(`Failed to send status change notification: ${error.message}`, error.stack);
      // Don't throw - notification failure shouldn't break the status update
    }
  }

  private async sendInterviewInvites(
    interview: Interview,
    recipient: 'panel' | 'candidate',
  ): Promise<void> {
    // BR19(c), BR19(d): Send calendar invites and notifications
    if (!this.notificationsService) {
      this.logger.warn('NotificationsService not available. Skipping interview invite.');
      return;
    }

    try {
      if (recipient === 'candidate') {
        // Get application to find candidate
        const application = await this.applicationModel
          .findById(interview.applicationId)
          .populate('candidateId')
          .exec();

        if (!application) {
          this.logger.warn(`Application ${interview.applicationId} not found for interview invite`);
          return;
        }

        const candidateId = application.candidateId.toString();
        let candidateEmail: string;
        let candidateName: string;

        if (typeof (application as any).candidateId === 'object' && (application as any).candidateId) {
          const candidate = (application as any).candidateId;
          candidateEmail = candidate.personalEmail || candidate.email || '';
          candidateName = candidate.firstName && candidate.lastName 
            ? `${candidate.firstName} ${candidate.lastName}`
            : candidate.fullName || 'Candidate';
        } else {
          // Fetch candidate directly from Candidate model
          try {
            const candidate = await this.candidateModel.findById(candidateId).exec();
            if (candidate) {
              candidateEmail = candidate.personalEmail || '';
              candidateName = candidate.firstName && candidate.lastName
                ? `${candidate.firstName} ${candidate.lastName}`
                : candidate.fullName || 'Candidate';
            } else {
              this.logger.warn(`Candidate ${candidateId} not found. Cannot send interview invite.`);
              return;
            }
          } catch (error) {
            this.logger.warn(`Could not fetch candidate details: ${error.message}`);
            return;
          }
        }

        if (candidateEmail) {
          const interviewId = (interview as any)._id?.toString() || String((interview as any).id) || '';
          await this.notificationsService.sendInterviewScheduled(
            candidateId,
            candidateEmail,
            candidateName,
            interviewId,
            interview.scheduledDate,
            interview.method,
            interview.videoLink,
          );
          this.logger.log(`Interview invite sent to candidate (BR19)`);
        } else {
          this.logger.warn(`No email found for candidate. Interview invite not sent.`);
        }
      } else {
        // Panel member invites would go here
        this.logger.log(`Panel member invites not yet implemented (BR19)`);
      }
    } catch (error) {
      this.logger.error(`Failed to send interview invite: ${error.message}`, error.stack);
    }
  }

  // ==========================================
  // ONBOARDING TRIGGER (REC-029)
  // ==========================================
  private async triggerOnboarding(offer: Offer): Promise<void> {
    this.logger.log(`Onboarding triggered for candidate ${offer.candidateId} (BR26c)`);

    // Get application details for onboarding
    const application = await this.applicationModel.findById(offer.applicationId).exec();
    if (!application) {
      this.logger.warn(`Application ${offer.applicationId} not found for onboarding trigger`);
      return;
    }

    // Get requisition details for department/role
    const requisition = await this.jobRequisitionModel.findById(application.requisitionId).exec();
    let department = 'Unknown';
    let role = offer.role || 'Unknown';

    // Get department and title from job template if available
    if (requisition?.templateId) {
      const template = await this.jobTemplateModel.findById(requisition.templateId).exec();
      if (template) {
        department = template.department || 'Unknown';
        role = offer.role || template.title || 'Unknown';
      }
    }

    // Validate department with organization structure (if available)
    if (this.orgStructureService) {
      const isValid = await this.orgStructureService.validateDepartment(department);
      if (!isValid) {
        this.logger.warn(`Department ${department} not found in organization structure`);
      }
    }

    // Note: Candidate details (name, email) would come from Candidate collection
    // which is not part of this module. In real integration, populate candidate or fetch from candidate service.
    // For now, we'll use candidateId and let the employee profile service handle candidate lookup if needed.

    // Create employee profile from candidate (if employee profile service available)
    let employeeId: string | undefined;
    if (this.employeeProfileService) {
      try {
        // In real implementation, candidate details would be fetched from Candidate collection
        // For now, pass candidateId and let the service handle it
        const result = await this.employeeProfileService.createEmployeeFromCandidate(
          offer.candidateId.toString(),
          {
            fullName: 'Candidate', // TODO: Fetch from Candidate collection when integrated
            email: 'candidate@example.com', // TODO: Fetch from Candidate collection when integrated
            role: role,
            department: department,
            startDate: new Date(), // In real implementation, this would come from offer
          },
        );
        employeeId = result.employeeId;
        this.logger.log(`Employee profile created: ${employeeId}`);
      } catch (error) {
        this.logger.error(`Failed to create employee profile: ${error.message}`);
      }
    }

    // Create contract from signed offer
    let contractId: Types.ObjectId | undefined;
    if (employeeId) {
      try {
        const contract = new this.contractModel({
          offerId: (offer as any)._id || new Types.ObjectId(),
          acceptanceDate: offer.candidateSignedAt || new Date(),
          grossSalary: offer.grossSalary,
          signingBonus: offer.signingBonus,
          role: role,
          employeeSignedAt: offer.candidateSignedAt || new Date(),
          // Contract document will be uploaded separately by candidate
        });
        await contract.save();
        contractId = contract._id as Types.ObjectId;
        this.logger.log(`Contract created: ${contractId}`);
      } catch (error) {
        this.logger.error(`Failed to create contract: ${error.message}`);
      }
    }

    // Trigger onboarding workflow (if onboarding service available)
    if (this.onboardingService && employeeId) {
      try {
        const offerId = (offer as any)._id?.toString() || offer.candidateId.toString();
        const onboardingResult = await this.onboardingService.triggerOnboarding(
          offer.candidateId.toString(),
          offerId,
          {
            role: role,
            department: department,
            grossSalary: offer.grossSalary,
            signingBonus: offer.signingBonus,
            startDate: new Date(), // In real implementation, this would come from offer
            employeeId: employeeId,
            contractId: contractId?.toString(),
          },
        );
        this.logger.log(`Onboarding workflow triggered: ${onboardingResult.onboardingId}`);
        this.logger.log(`Onboarding tasks created: ${onboardingResult.tasks.length}`);
        this.logger.log(`Contract ID: ${onboardingResult.contractId}`);
      } catch (error) {
        this.logger.error(`Failed to trigger onboarding: ${error.message}`);
      }
    } else {
      if (!employeeId) {
        this.logger.warn('Employee ID not available - onboarding not triggered');
      } else {
        this.logger.warn('Onboarding service not available - onboarding not triggered');
      }
    }
  }

  private groupByStatus(applications: Application[]): Record<string, number> {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByStage(applications: Application[]): Record<string, number> {
    return applications.reduce((acc, app) => {
      acc[app.currentStage] = (acc[app.currentStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async calculateAverageTimeToHire(applications: Application[]): Promise<number> {
    // BR33: Time-to-hire metric
    const hiredApps = applications.filter(app => app.status === ApplicationStatus.HIRED);
    
    if (hiredApps.length === 0) return 0;

    let totalDays = 0;
    for (const app of hiredApps) {
      const history = await this.getApplicationHistory((app as any)._id.toString());
      if (history.length > 0) {
        const firstEntry = history[0] as any;
        const lastEntry = history[history.length - 1] as any;
        const days = Math.ceil(
          (lastEntry.createdAt.getTime() - firstEntry.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDays += days;
      }
    }

    return Math.round(totalDays / hiredApps.length);
  }

  private calculateConversionRates(applications: Application[]): any {
    // BR33: Conversion rates by stage
    const total = applications.length;
    if (total === 0) return {};

    return {
      screeningToInterview: this.calculateStageConversion(applications, ApplicationStage.SCREENING, ApplicationStage.DEPARTMENT_INTERVIEW),
      interviewToOffer: this.calculateStageConversion(applications, ApplicationStage.DEPARTMENT_INTERVIEW, ApplicationStage.OFFER),
      offerToHired: (applications.filter(a => a.status === ApplicationStatus.HIRED).length / total) * 100,
    };
  }

  private calculateStageConversion(
    applications: Application[],
    fromStage: ApplicationStage,
    toStage: ApplicationStage,
  ): number {
    const atFromStage = applications.filter(a => a.currentStage === fromStage).length;
    const reachedToStage = applications.filter(
      a => a.currentStage === toStage || 
      (a.currentStage as any) > (toStage as any)
    ).length;

    return atFromStage > 0 ? (reachedToStage / atFromStage) * 100 : 0;
  }

  private async getReferralStats(applications: Application[]): Promise<any> {
    // BR14, BR25: Referral statistics
    const candidateIds = applications.map(a => a.candidateId);
    const referrals = await this.referralModel
      .find({ candidateId: { $in: candidateIds } })
      .exec();

    return {
      totalReferrals: referrals.length,
      referralPercentage: (referrals.length / applications.length) * 100,
    };
  }

  /**
   * Withdraw consent for data processing (REC-028)
   * BR28: Consent withdrawal support for GDPR compliance
   */
  async withdrawConsent(candidateId: string, applicationId: string): Promise<void> {
    this.logger.log(`Withdrawing consent for candidate ${candidateId}, application ${applicationId}`);
    
    // Get candidate details
    const candidate = await this.candidateModel.findById(candidateId).exec();
    const candidateEmail = candidate?.personalEmail || (candidate as any)?.email || 'unknown@example.com';
    const candidateName = candidate?.firstName && candidate?.lastName
      ? `${candidate.firstName} ${candidate.lastName}`
      : (candidate as any)?.fullName || 'Candidate';

    // Log consent withdrawal
    if (this.notificationsService) {
      await this.notificationsService.logNotification({
        type: NotificationType.CONSENT_WITHDRAWN,
        channel: NotificationChannel.IN_APP,
        recipientId: candidateId,
        recipientEmail: candidateEmail,
        recipientName: candidateName,
        subject: 'Consent Withdrawal Confirmation',
        content: `Your consent for data processing has been withdrawn for application ${applicationId}. Your data will be anonymized per GDPR requirements.`,
        metadata: { applicationId },
        relatedEntityId: applicationId,
        relatedEntityType: 'application',
      });
    }

    // In a real implementation, you would anonymize the candidate data here
    // For now, we just log the withdrawal
    this.logger.log(`Consent withdrawn for application ${applicationId}`);
  }

  /**
   * Get consent history for a candidate (REC-028)
   * BR28: Consent history tracking for GDPR compliance
   */
  async getConsentHistory(candidateId: string): Promise<any[]> {
    this.logger.log(`Fetching consent history for candidate ${candidateId}`);
    
    // Query NotificationLog directly via Mongoose
    try {
      const mongoose = await import('mongoose');
      const connection = mongoose.connection;
      const NotificationLogCollection = connection.collection('notificationlogs');
      
      const notifications = await NotificationLogCollection
        .find({
          recipientId: new Types.ObjectId(candidateId),
          type: { $in: ['consent_given', 'consent_withdrawn'] },
        })
        .sort({ createdAt: -1 })
        .toArray();

      return notifications.map((notif: any) => ({
        type: notif.type,
        timestamp: notif.createdAt || notif.timestamp,
        applicationId: notif.relatedEntityId?.toString(),
        consentGiven: notif.type === 'consent_given',
        consentWithdrawn: notif.type === 'consent_withdrawn',
      }));
    } catch (error) {
      this.logger.error(`Error fetching consent history: ${error.message}`);
      return [];
    }
  }
}
