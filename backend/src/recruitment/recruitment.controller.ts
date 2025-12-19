import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RecruitmentService } from './recruitment.service';
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
  CreateOnboardingChecklistDto,
  UpdateOnboardingTaskDto,
  UploadDocumentDto,
  CreateTerminationRequestDto,
  InitiateTerminationReviewDto,
  UpdateClearanceItemDto,
  UpdateEquipmentReturnDto,
} from './dto';
import { ReserveEquipmentDto } from './dto/reserve-equipment.dto';
import { ValidationPipe } from '@nestjs/common';
import { OnboardingService } from './services/onboarding.service';
import { OffboardingService } from './services/offboarding.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class RecruitmentController {
    constructor(
      private readonly recruitmentService: RecruitmentService,
      private readonly onboardingService: OnboardingService,
      private readonly offboardingService: OffboardingService,
    ) {}
  
    @Get()
    @ApiOperation({ summary: 'API Information' })
    @ApiResponse({
      status: 200,
      description: 'API information and available endpoints',
    })
    getApiInfo() {
      return {
        message: 'HR Recruitment, Onboarding & Offboarding API',
        version: '1.0',
        documentation: '/api',
        endpoints: {
          templates: '/templates',
          jobs: '/jobs',
          applications: '/applications',
          interviews: '/interviews',
          referrals: '/referrals',
          offers: '/offers',
          analytics: '/analytics/recruitment',
          consent: '/consent',
        },
      };
    }
  
    // ==========================================
    // JOB TEMPLATES (REC-003) - BR2
    // ==========================================
  
    @ApiTags('jobs')
    @ApiOperation({
      summary: 'Create job template (REC-003)',
      description:
        'HR Manager defines standardized job description templates. BR2: Must include title, department, qualifications, and skills.',
    })
    @ApiResponse({
      status: 201,
      description: 'Job template created successfully',
    })
    @ApiResponse({ status: 400, description: 'Validation failed (BR2)' })
    @Roles('hr_manager')
    @Post('templates')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createJobTemplate(@Body() dto: CreateJobTemplateDto) {
      return this.recruitmentService.createJobTemplate(dto);
    }
  
    @ApiTags('jobs')
    @ApiOperation({ summary: 'Get all job templates (REC-003)' })
    @ApiResponse({ status: 200, description: 'List of job templates' })
    @Get('templates')
    async getAllTemplates() {
      return this.recruitmentService.findAllJobTemplates();
    }
  
    @ApiTags('jobs')
    @ApiOperation({ summary: 'Get job template by ID (REC-003)' })
    @ApiParam({ name: 'id', description: 'Job template ID' })
    @ApiResponse({ status: 200, description: 'Job template found' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    @Get('templates/:id')
    async getTemplate(@Param('id') id: string) {
      return this.recruitmentService.findJobTemplateById(id);
    }
  
    @ApiTags('jobs')
    @ApiOperation({ summary: 'Update job template (REC-003)' })
    @ApiParam({ name: 'id', description: 'Job template ID' })
    @ApiResponse({ status: 200, description: 'Template updated' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    @Roles('hr_manager')
    @Put('templates/:id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateTemplate(
      @Param('id') id: string,
      @Body() dto: UpdateJobTemplateDto,
    ) {
      return this.recruitmentService.updateJobTemplate(id, dto);
    }
  
    @ApiTags('jobs')
    @ApiOperation({ summary: 'Delete job template (REC-003)' })
    @ApiParam({ name: 'id', description: 'Job template ID' })
    @ApiResponse({ status: 200, description: 'Template deleted' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    @Roles('hr_manager')
    @Delete('templates/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteTemplate(@Param('id') id: string) {
      return this.recruitmentService.deleteJobTemplate(id);
    }
  
    // ==========================================
    // JOB REQUISITIONS (REC-003, REC-004, REC-023) - BR2, BR6, BR9
    // ==========================================
  
    @ApiTags('jobs')
    @ApiOperation({
      summary: 'Create job requisition (REC-003, REC-004)',
      description:
        'Create a job requisition using a template. BR2: Must include job details and qualifications. BR9: Applications tracked through stages.',
    })
    @ApiResponse({ status: 201, description: 'Job requisition created' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @Roles('hr_manager')
    @Post('jobs')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createJob(@Body() dto: CreateJobRequisitionDto) {
      return this.recruitmentService.createJobRequisition(dto);
    }
  
    @ApiTags('jobs')
    @ApiOperation({ 
      summary: 'List all job requisitions',
      description: 'Candidates only see published jobs. HR employees see all jobs (published, draft, closed).'
    })
    @ApiResponse({ status: 200, description: 'List of job requisitions' })
    @Get('jobs')
    async listJobs(@Req() req: any) {
      const userRole = req.user?.role;
      return this.recruitmentService.findAllJobRequisitions(userRole);
    }
  
    @ApiTags('jobs')
    @ApiOperation({
      summary: 'Get job requisition by ID',
      description: 'Get a single job/requisition (preview for careers page). Candidates can only access published jobs.',
    })
    @ApiParam({ name: 'id', description: 'Job requisition ID' })
    @ApiResponse({ status: 200, description: 'Job requisition found' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @Get('jobs/:id')
    async getJob(@Param('id') id: string, @Req() req: any) {
      const userRole = req.user?.role;
      return this.recruitmentService.findJobRequisitionById(id, userRole);
    }
  
    @ApiTags('jobs')
    @ApiOperation({
      summary: 'Publish job to career sites (REC-023)',
      description:
        'Preview and publish jobs on company careers page. BR6: Automatic posting to internal and external career sites.',
    })
    @ApiParam({ name: 'id', description: 'Job requisition ID' })
    @ApiResponse({ status: 200, description: 'Job published successfully' })
    @ApiResponse({ status: 400, description: 'Job already published' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @Roles('hr_manager')
    @Post('jobs/:id/publish')
    async publishJob(@Param('id') id: string) {
      return this.recruitmentService.publishJobRequisition(id);
    }
  
    @ApiTags('jobs')
    @ApiOperation({ summary: 'Update job requisition' })
    @ApiParam({ name: 'id', description: 'Job requisition ID' })
    @ApiResponse({ status: 200, description: 'Job updated' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @Roles('hr_manager')
    @Put('jobs/:id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateJob(
      @Param('id') id: string,
      @Body() dto: UpdateJobRequisitionDto,
    ) {
      return this.recruitmentService.updateJobRequisition(id, dto);
    }
  
    // ==========================================
    // APPLICATIONS (REC-007, REC-008, REC-017, REC-022, REC-028) - BR12, BR9, BR27, BR28, BR36, BR37
    // ==========================================
  
    @ApiTags('applications')
    @ApiOperation({
      summary: 'Apply to a job (REC-007, REC-028)',
      description:
        'Candidate uploads CV and applies for position. BR12: Creates talent pool. BR28: Consent required for data processing.',
    })
    @ApiResponse({ status: 201, description: 'Application created successfully' })
    @ApiResponse({
      status: 400,
      description: 'Validation failed or consent not given (BR28)',
    })
    @Post('applications')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async apply(@Body() dto: CreateApplicationDto) {
      return this.recruitmentService.createApplication(dto);
    }
  
    @ApiTags('applications')
    @ApiOperation({ 
      summary: 'Get all applications',
      description: 'Candidates only see their own applications. HR employees see all applications.'
    })
    @ApiQuery({ name: 'stage', required: false, description: 'Filter by application stage' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by application status' })
    @ApiQuery({ name: 'candidateId', required: false, description: 'Filter by candidate ID' })
    @ApiResponse({ status: 200, description: 'List of applications' })
    @Get('applications')
    async getAllApplications(
      @Req() req: any,
      @Query('stage') stage?: string,
      @Query('status') status?: string,
      @Query('candidateId') candidateId?: string,
    ) {
      const userRole = req.user?.role;
      const userId = req.user?.userId || req.user?._id || req.user?.id;
      
      const filters: any = {};
      if (stage) filters.currentStage = stage;
      if (status) filters.status = status;
      if (candidateId) filters.candidateId = candidateId;
      return this.recruitmentService.findAllApplications(
        Object.keys(filters).length > 0 ? filters : undefined,
        userRole,
        userId,
      );
    }
  
    @ApiTags('applications')
    @ApiOperation({
      summary: 'Get application by ID',
      description: 'Get application details including status and history. Candidates can only access their own applications.',
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiResponse({ status: 200, description: 'Application found' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @Get('applications/:id')
    async getApplication(@Param('id') id: string, @Req() req: any) {
      const userRole = req.user?.role;
      const userId = req.user?.userId || req.user?._id || req.user?.id;
      return this.recruitmentService.findApplicationById(id, userRole, userId);
    }
  
    @ApiTags('applications')
    @ApiOperation({
      summary: 'Get application status and history (REC-017, REC-008)',
      description:
        'Get status of an application with tracking history. BR27: Real-time status tracking.',
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiResponse({
      status: 200,
      description: 'Application status and history',
    })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @Get('applications/:id/status')
    async getStatus(@Param('id') id: string) {
      const application = await this.recruitmentService.findApplicationById(id);
      const history = await this.recruitmentService.getApplicationHistory(id);
      return {
        application,
        history,
      };
    }
  
    @ApiTags('applications')
    @ApiOperation({
      summary: 'Update application status (REC-008, REC-022)',
      description:
        'Update status of an application. BR9: Track through defined stages. BR11: Triggers notifications.',
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiBody({ type: UpdateApplicationStatusDto })
    @ApiResponse({
      status: 200,
      description: 'Status updated successfully',
    })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @Post('applications/:id/status')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatus(
      @Param('id') id: string,
      @Body() dto: UpdateApplicationStatusDto,
    ) {
      // In real implementation, get userId from JWT token
      const changedBy = 'system'; // TODO: Extract from JWT token
      return this.recruitmentService.updateApplicationStatus(id, dto, changedBy);
    }
  
    @ApiTags('applications')
    @ApiOperation({
      summary: 'Send rejection notification (REC-022)',
      description:
        'Send automated rejection notification to candidate. BR36: Automated alerts/emails. BR37: Communication logs stored.',
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiBody({ type: RejectionTemplateDto })
    @ApiResponse({
      status: 200,
      description: 'Rejection notification sent',
    })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @Post('applications/:id/reject')
    @UsePipes(new ValidationPipe({ transform: true }))
    async notifyCandidate(
      @Param('id') id: string,
      @Body() template: RejectionTemplateDto,
    ) {
      await this.recruitmentService.sendRejectionNotification(id, template);
      return {
        message: 'Rejection notification sent successfully',
        applicationId: id,
      };
    }
  
    // ==========================================
    // INTERVIEWS (REC-010, REC-011, REC-020, REC-021) - BR19, BR20, BR21, BR22, BR23
    // ==========================================
  
    @ApiTags('interviews')
    @ApiOperation({
      summary: 'Schedule interview (REC-010, REC-021)',
      description:
        'Schedule and manage interview invitations. BR19: Select time slots, panel members, modes. Automatic calendar invites and candidate notifications.',
    })
    @ApiResponse({
      status: 201,
      description: 'Interview scheduled successfully',
    })
    @ApiResponse({ status: 400, description: 'Validation failed (BR19)' })
    @Post('interviews')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async scheduleInterview(@Body() dto: ScheduleInterviewDto) {
      return this.recruitmentService.scheduleInterview(dto);
    }
  
    @ApiTags('interviews')
    @ApiOperation({ summary: 'Get all interviews for an application' })
    @ApiQuery({
      name: 'applicationId',
      required: false,
      description: 'Application ID (optional - if not provided, returns all interviews)',
    })
    @ApiResponse({ status: 200, description: 'List of interviews' })
    @Get('interviews')
    async getInterviews(@Query('applicationId') applicationId?: string) {
      if (applicationId) {
        return this.recruitmentService.findInterviewsByApplication(applicationId);
      }
      // Return all interviews sorted by date
      return this.recruitmentService.findAllInterviews();
    }
  
    @ApiTags('interviews')
    @ApiOperation({
      summary: 'Get interview details (REC-010, REC-021)',
      description: 'Get interview details including panel members and schedule',
    })
    @ApiParam({ name: 'id', description: 'Interview ID' })
    @ApiResponse({ status: 200, description: 'Interview found' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    @Get('interviews/:id')
    async getInterview(@Param('id') id: string) {
      return this.recruitmentService.findInterviewById(id);
    }
  
    @ApiTags('interviews')
    @ApiOperation({
      summary: 'Submit interview feedback (REC-011, REC-020)',
      description:
        'Submit feedback/interview score. BR10: Comments and ratings. BR22: Only panel members can submit. BR21/BR23: Structured assessment.',
    })
    @ApiParam({ name: 'id', description: 'Interview ID' })
    @ApiBody({ type: SubmitInterviewFeedbackDto })
    @ApiResponse({
      status: 201,
      description: 'Feedback submitted successfully',
    })
    @ApiResponse({
      status: 400,
      description: 'Interviewer not in panel (BR22)',
    })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    @Post('interviews/:id/feedback')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async submitFeedback(
      @Param('id') interviewId: string,
      @Body() dto: SubmitInterviewFeedbackDto,
    ) {
      // The DTO already expects interviewId, but we get it from URL param
      const feedbackDto: SubmitInterviewFeedbackDto = {
        ...dto,
        interviewId, // Override with URL parameter
      };
      return this.recruitmentService.submitInterviewFeedback(feedbackDto);
    }
  
    // ==========================================
    // REFERRALS (REC-030) - BR14, BR25
    // ==========================================
  
    @ApiTags('recruitment')
    @ApiOperation({
      summary: 'Tag candidate as referral (REC-030)',
      description:
        'Tag candidates as referrals for priority screening. BR14: Rule-based filters. BR25: Tie-breaking rules.',
    })
    @ApiResponse({ status: 201, description: 'Candidate tagged as referral' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @Post('referrals')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async tagReferral(@Body() dto: CreateReferralDto) {
      return this.recruitmentService.createReferral(dto);
    }
  
    @ApiTags('recruitment')
    @ApiOperation({ summary: 'Get referrals (all or by candidate)' })
    @ApiQuery({
      name: 'candidateId',
      required: false,
      description: 'Optional: Filter by candidate ID',
    })
    @ApiResponse({ status: 200, description: 'List of referrals' })
    @Get('referrals')
    async getReferrals(@Query('candidateId') candidateId?: string) {
      if (candidateId) {
        return this.recruitmentService.findReferralsByCandidate(candidateId);
      }
      return this.recruitmentService.findAllReferrals();
    }
  
    // ==========================================
    // OFFERS (REC-014, REC-018, REC-029) - BR26, BR37
    // ==========================================
  
    @ApiTags('offers')
    @ApiOperation({
      summary: 'Create offer letter (REC-014, REC-018)',
      description:
        'Generate and send offer letter. BR26(a): Customizable and editable. BR26(b): Requires approvals before sending.',
    })
    @ApiResponse({
      status: 201,
      description: 'Offer created successfully',
    })
    @ApiResponse({
      status: 400,
      description: 'Application not at offer stage',
    })
    @Roles('hr_manager')
    @Post('offers')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createOffer(@Body() dto: CreateOfferDto) {
      return this.recruitmentService.createOffer(dto);
    }
  
    @ApiTags('offers')
    @ApiOperation({ summary: 'List all offers' })
    @ApiResponse({ status: 200, description: 'List of offers' })
    @Get('offers')
    async listOffers() {
      return this.recruitmentService.findAllOffers();
    }

    @ApiTags('offers')
    @ApiOperation({ summary: 'Get offer by ID' })
    @ApiParam({ name: 'id', description: 'Offer ID' })
    @ApiResponse({ status: 200, description: 'Offer found' })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    @Get('offers/:id')
    async getOffer(@Param('id') id: string) {
      try {
        return await this.recruitmentService.findOfferById(id);
      } catch (error) {
        throw error;
      }
    }
  
    @ApiTags('offers')
    @ApiOperation({
      summary: 'Approve offer (REC-014)',
      description:
        'Approve offer by authorized party. BR26(b): Multi-party approval workflow.',
    })
    @ApiParam({ name: 'id', description: 'Offer ID' })
    @ApiBody({ type: ApproveOfferDto })
    @ApiResponse({ status: 200, description: 'Offer approved' })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    @Roles('hr_manager')
    @Post('offers/:id/approve')
    @UsePipes(new ValidationPipe({ transform: true }))
    async approveOffer(@Param('id') id: string, @Body() dto: ApproveOfferDto) {
      return this.recruitmentService.approveOffer(id, dto);
    }
  
    @ApiTags('offers')
    @ApiOperation({
      summary: 'Accept offer and trigger onboarding (REC-018, REC-029)',
      description:
        'Candidate accepts offer. BR26(c): Triggers onboarding. BR26(d)/BR37: Communication logs stored.',
    })
    @ApiParam({ name: 'id', description: 'Offer ID' })
    @ApiBody({ type: RespondOfferDto })
    @ApiResponse({
      status: 200,
      description: 'Offer accepted, onboarding triggered',
    })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    @Post('offers/:id/accept')
    @UsePipes(new ValidationPipe({ transform: true }))
    async acceptOffer(@Param('id') id: string, @Body() dto: RespondOfferDto) {
      return this.recruitmentService.respondToOffer(id, dto);
    }
  
    // ==========================================
    // ANALYTICS (REC-009) - BR33
    // ==========================================
  
    @ApiTags('analytics')
    @ApiOperation({
      summary: 'Get recruitment analytics (REC-009)',
      description:
        'Monitor recruitment progress across all open positions. BR33: Multiple reports (time-to-hire, source effectiveness).',
    })
    @ApiQuery({ name: 'startDate', required: false, type: Date })
    @ApiQuery({ name: 'endDate', required: false, type: Date })
    @ApiQuery({ name: 'requisitionId', required: false, type: String })
    @ApiQuery({
      name: 'status',
      required: false,
      enum: ['submitted', 'in_process', 'offer', 'hired', 'rejected'],
    })
    @ApiResponse({ status: 200, description: 'Analytics data' })
    @Get('analytics/recruitment')
    async getRecruitmentAnalytics(@Query() query: AnalyticsQueryDto) {
      return this.recruitmentService.getRecruitmentAnalytics(query);
    }
  
    // ==========================================
    // CONSENT (REC-028) - BR28
    // ==========================================
  
    @ApiTags('applications')
    @ApiOperation({
      summary: 'Save candidate consent (REC-028)',
      description:
        'Save consent for personal-data processing and background checks. BR28: Required for GDPR compliance.',
    })
    @ApiResponse({ status: 201, description: 'Consent saved' })
    @ApiResponse({
      status: 400,
      description: 'Consent is required (BR28)',
    })
    @Post('consent')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async saveConsent(
      @Body() dto: { candidateId: string; consentGiven: boolean },
    ) {
      // Consent is handled in createApplication, but this endpoint allows updating consent
      if (!dto.consentGiven) {
        return {
          message: 'Consent is required for data processing (BR28)',
        };
      }
      return { message: 'Consent saved successfully', consent: dto };
    }

    @ApiTags('applications')
    @ApiOperation({
      summary: 'Withdraw consent for data processing (REC-028)',
      description:
        'Allow candidates to withdraw consent for data processing. BR28, NFR-33: GDPR compliance - right to withdraw consent.',
    })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @ApiResponse({ status: 200, description: 'Consent withdrawn successfully' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @Post('applications/:applicationId/withdraw-consent')
    @HttpCode(HttpStatus.OK)
    async withdrawConsent(
      @Param('applicationId') applicationId: string,
      @Body() dto: { candidateId: string },
    ) {
      await this.recruitmentService.withdrawConsent(dto.candidateId, applicationId);
      return { message: 'Consent withdrawn successfully. Data will be anonymized per GDPR requirements.' };
    }

    @ApiTags('applications')
    @ApiOperation({
      summary: 'Get consent history for candidate (REC-028)',
      description:
        'Get all consent-related notifications for a candidate. BR28: Consent history tracking for GDPR compliance.',
    })
    @ApiParam({ name: 'candidateId', description: 'Candidate ID' })
    @ApiResponse({ status: 200, description: 'Consent history retrieved' })
    @Get('candidates/:candidateId/consent-history')
    async getConsentHistory(@Param('candidateId') candidateId: string) {
      return this.recruitmentService.getConsentHistory(candidateId);
    }

    // ==========================================
    // EVALUATION CRITERIA (REC-020, REC-015) - BR21, BR23
    // ==========================================

    @ApiTags('interviews')
    @ApiOperation({
      summary: 'Get evaluation criteria for role (REC-020, REC-015)',
      description:
        'Get pre-set evaluation criteria for a specific role. BR21: Criteria are pre-set and agreed upon.',
    })
    @ApiQuery({ name: 'role', required: true, description: 'Job role/title' })
    @ApiQuery({ name: 'department', required: false, description: 'Department name' })
    @ApiResponse({ status: 200, description: 'Evaluation criteria retrieved' })
    @Get('evaluation-criteria')
    async getEvaluationCriteria(
      @Query('role') role: string,
      @Query('department') department?: string,
    ) {
      return this.recruitmentService.getEvaluationCriteria(role, department);
    }

    // ==========================================
    // ONBOARDING (REC-029) - Multiple User Stories
    // ==========================================

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Get onboarding by employee ID',
      description: 'New Hire views their onboarding steps in a tracker',
    })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({ status: 200, description: 'Onboarding found' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    @Get('onboarding/employee/:employeeId')
    async getOnboardingByEmployee(@Param('employeeId') employeeId: string) {
      return this.onboardingService.getOnboardingByEmployeeId(employeeId);
    }

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Get onboarding by ID',
      description: 'Get onboarding details with tasks',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiResponse({ status: 200, description: 'Onboarding found' })
    @ApiResponse({ status: 404, description: 'Onboarding not found' })
    @Get('onboarding/:id')
    async getOnboarding(@Param('id') id: string) {
      return this.onboardingService.getOnboardingById(id);
    }

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Create onboarding checklist template (HR Manager)',
      description: 'HR Manager creates onboarding task checklists for new hires',
    })
    @ApiBody({ type: CreateOnboardingChecklistDto })
    @ApiResponse({ status: 201, description: 'Checklist created' })
    @Roles('hr_manager')
    @Post('onboarding/checklists')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createOnboardingChecklist(@Body() dto: CreateOnboardingChecklistDto) {
      return this.onboardingService.createOnboardingChecklist(dto);
    }

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Update onboarding task',
      description: 'Update task status, upload documents, mark as completed',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiParam({ name: 'taskIndex', description: 'Task index (0-based)' })
    @ApiBody({ type: UpdateOnboardingTaskDto })
    @ApiResponse({ status: 200, description: 'Task updated' })
    @Put('onboarding/:id/tasks/:taskIndex')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateOnboardingTask(
      @Param('id') id: string,
      @Param('taskIndex') taskIndex: string,
      @Body() dto: UpdateOnboardingTaskDto,
    ) {
      return this.onboardingService.updateOnboardingTask(id, parseInt(taskIndex, 10), dto);
    }

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Upload document for onboarding',
      description: 'Candidate/New Hire uploads signed contract, ID, certificates, etc.',
    })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({ status: 201, description: 'Document uploaded' })
    @Post('onboarding/:employeeId/documents')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads/onboarding',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${req.params.employeeId}-${uniqueSuffix}${ext}`);
          },
        }),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
        fileFilter: (req, file, cb) => {
          const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
          ];
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG are allowed.'), false);
          }
        },
      }),
    )
    async uploadDocument(
      @Param('employeeId') employeeId: string,
      @UploadedFile() file: Express.Multer.File,
      @Body('type') type: string,
    ) {
      if (!file) {
        throw new BadRequestException('File is required');
      }
      
      const filePath = file.path;
      return this.onboardingService.uploadDocument(employeeId, {
        type: type as any,
        filePath,
        ownerId: employeeId,
      });
    }

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Get contract by offer ID (HR Manager)',
      description: 'HR Manager accesses signed contract details to create employee profile',
    })
    @ApiParam({ name: 'offerId', description: 'Offer ID' })
    @ApiResponse({ status: 200, description: 'Contract found' })
    @ApiResponse({ status: 404, description: 'Contract not found' })
    @Roles('hr_manager')
    @Get('contracts/offer/:offerId')
    async getContractByOffer(@Param('offerId') offerId: string) {
      return this.onboardingService.getContractByOfferId(offerId);
    }

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Get contract by ID',
      description: 'Get contract details',
    })
    @ApiParam({ name: 'id', description: 'Contract ID' })
    @ApiResponse({ status: 200, description: 'Contract found' })
    @ApiResponse({ status: 404, description: 'Contract not found' })
    @Get('contracts/:id')
    async getContract(@Param('id') id: string) {
      return this.onboardingService.getContractById(id);
    }

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Reserve equipment for new hire (HR Employee)',
      description: 'HR Employee reserves and tracks equipment, desk, and access cards for new hires',
    })
    @ApiParam({ name: 'id', description: 'Onboarding ID' })
    @ApiParam({ name: 'taskIndex', description: 'Task index (0-based)' })
    @ApiBody({ type: ReserveEquipmentDto })
    @ApiResponse({ status: 200, description: 'Equipment reserved' })
    @Roles('hr_employee', 'hr_manager')
    @Post('onboarding/:id/tasks/:taskIndex/reserve-equipment')
    @UsePipes(new ValidationPipe({ transform: true }))
    async reserveEquipment(
      @Param('id') id: string,
      @Param('taskIndex') taskIndex: string,
      @Body() dto: ReserveEquipmentDto,
    ) {
      return this.onboardingService.reserveEquipment(id, parseInt(taskIndex, 10), dto);
    }

    // ==========================================
    // OFFBOARDING - Termination & Resignation
    // ==========================================

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Employee requests resignation',
      description: 'Employee submits resignation request with reasoning',
    })
    @ApiBody({ type: CreateTerminationRequestDto })
    @ApiResponse({ status: 201, description: 'Resignation request created' })
    @Post('termination-requests/resignation')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createResignationRequest(@Body() dto: CreateTerminationRequestDto) {
      return this.offboardingService.createResignationRequest(dto);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Get resignation requests by employee',
      description: 'Employee tracks their resignation request status',
    })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({ status: 200, description: 'Resignation requests found' })
    @Get('termination-requests/employee/:employeeId')
    async getResignationRequestsByEmployee(@Param('employeeId') employeeId: string) {
      return this.offboardingService.getTerminationRequestsByEmployee(employeeId);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'HR Manager initiates termination review',
      description: 'HR Manager initiates termination based on warnings/performance data',
    })
    @ApiBody({ type: InitiateTerminationReviewDto })
    @ApiResponse({ status: 201, description: 'Termination review initiated' })
    @Roles('hr_manager')
    @Post('termination-requests/review')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async initiateTerminationReview(@Body() dto: InitiateTerminationReviewDto) {
      return this.offboardingService.initiateTerminationReview(dto);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Get all termination requests',
      description: 'HR Manager views all termination requests',
    })
    @ApiResponse({ status: 200, description: 'Termination requests found' })
    @Roles('hr_manager', 'hr_employee', 'hr_admin')
    @Get('termination-requests')
    async getAllTerminationRequests() {
      return this.offboardingService.getAllTerminationRequests();
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Get termination request by ID',
      description: 'Get termination request details',
    })
    @ApiParam({ name: 'id', description: 'Termination request ID' })
    @ApiResponse({ status: 200, description: 'Termination request found' })
    @Get('termination-requests/:id')
    async getTerminationRequest(@Param('id') id: string) {
      return this.offboardingService.getTerminationRequestById(id);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Approve termination request',
      description: 'HR Manager approves termination and triggers offboarding',
    })
    @ApiParam({ name: 'id', description: 'Termination request ID' })
    @ApiResponse({ status: 200, description: 'Termination approved' })
    @Roles('hr_manager')
    @Post('termination-requests/:id/approve')
    @UsePipes(new ValidationPipe({ transform: true }))
    async approveTermination(@Param('id') id: string) {
      return this.offboardingService.approveTermination(id);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Get clearance checklist',
      description: 'Get offboarding checklist for termination',
    })
    @ApiParam({ name: 'terminationId', description: 'Termination request ID' })
    @ApiResponse({ status: 200, description: 'Clearance checklist found' })
    @Get('clearance-checklist/:terminationId')
    async getClearanceChecklist(@Param('terminationId') terminationId: string) {
      return this.offboardingService.getClearanceChecklist(terminationId);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Update clearance item (multi-department sign-off)',
      description: 'Department updates their clearance status (IT, Finance, Facilities, Line Manager)',
    })
    @ApiParam({ name: 'terminationId', description: 'Termination request ID' })
    @ApiParam({ name: 'department', description: 'Department name' })
    @ApiBody({ type: UpdateClearanceItemDto })
    @ApiResponse({ status: 200, description: 'Clearance item updated' })
    @Put('clearance-checklist/:terminationId/departments/:department')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateClearanceItem(
      @Param('terminationId') terminationId: string,
      @Param('department') department: string,
      @Body() dto: UpdateClearanceItemDto,
      @Req() req: any,
    ) {
      const updatedBy = req.user?.id || 'system';
      return this.offboardingService.updateClearanceItem(terminationId, department, dto, updatedBy);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Update equipment return status',
      description: 'Track equipment return (IT assets, ID cards, etc.)',
    })
    @ApiParam({ name: 'terminationId', description: 'Termination request ID' })
    @ApiBody({ type: UpdateEquipmentReturnDto })
    @ApiResponse({ status: 200, description: 'Equipment return updated' })
    @Put('clearance-checklist/:terminationId/equipment')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateEquipmentReturn(
      @Param('terminationId') terminationId: string,
      @Body() dto: UpdateEquipmentReturnDto,
    ) {
      return this.offboardingService.updateEquipmentReturn(terminationId, dto);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Mark access card as returned',
      description: 'Mark access card return in clearance checklist',
    })
    @ApiParam({ name: 'terminationId', description: 'Termination request ID' })
    @ApiResponse({ status: 200, description: 'Card marked as returned' })
    @Post('clearance-checklist/:terminationId/card-returned')
    async markCardReturned(@Param('terminationId') terminationId: string) {
      return this.offboardingService.markCardReturned(terminationId);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Get employee performance data',
      description: 'Get warnings and low performance scores for termination review',
    })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({ status: 200, description: 'Performance data found' })
    @Roles('hr_manager')
    @Get('termination-requests/employee/:employeeId/performance')
    async getEmployeePerformanceData(@Param('employeeId') employeeId: string) {
      return this.offboardingService.getEmployeePerformanceData(employeeId);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Get employee leave balance',
      description: 'Get leave balance for final payroll calculations',
    })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({ status: 200, description: 'Leave balance found' })
    @Roles('hr_manager', 'hr_employee')
    @Get('termination-requests/employee/:employeeId/leave-balance')
    async getEmployeeLeaveBalance(@Param('employeeId') employeeId: string) {
      return this.offboardingService.getEmployeeLeaveBalance(employeeId);
    }

    @ApiTags('offboarding')
    @ApiOperation({
      summary: 'Revoke system access (System Admin)',
      description: 'Revoke system and account access upon termination. This disables the user account, invalidates tokens, and revokes all system access.',
    })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({ status: 200, description: 'System access revoked' })
    @Roles('system_admin')
    @Post('termination-requests/employee/:employeeId/revoke-access')
    async revokeSystemAccess(@Param('employeeId') employeeId: string) {
      await this.offboardingService.revokeSystemAccess(employeeId);
      return { message: 'System access revocation initiated. Account disabled, tokens invalidated, and all system access revoked.' };
    }

    // ==========================================
    // SYSTEM ADMIN PROVISIONING (ONB-009, ONB-013)
    // ==========================================

    @ApiTags('onboarding')
    @ApiOperation({
      summary: 'Trigger system access provisioning (System Admin) - ONB-009',
      description: 'System Admin triggers actual provisioning of email, SSO, payroll, and internal system access for a new hire.',
    })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({ status: 200, description: 'Provisioning triggered' })
    @Roles('system_admin')
    @Post('onboarding/employee/:employeeId/provision-access')
    async provisionSystemAccess(@Param('employeeId') employeeId: string) {
      return this.onboardingService.provisionSystemAccess(employeeId);
    }
}