import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Create a job requisition using a template (REC-003, REC-004). Only HR Managers allowed.
   */
  @Roles('hr_manager')
  @Post('jobs')
  createJob(@Body() createJobDto: any) {
    // TODO: Hand off to service; validate createJobDto
    return { message: 'Job requisition created', job: createJobDto };
  }

  /**
   * List all job postings (authenticated users)
   */
  @Get('jobs')
  listJobs() {
    // TODO: Replace with real service call
    return [
      { id: '1', title: 'Software Engineer', status: 'published' },
      { id: '2', title: 'HR Assistant', status: 'draft' }
    ];
  }

  /**
   * Get a single job/requisition (preview for careers page)
   */
  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    // TODO: Replace with real service call
    return { id, title: 'Sample Job', status: 'draft' };
  }

  /**
   * Publish a job to internal/external career sites (REC-023)
   */
  @Roles('hr_manager')
  @Post('jobs/:id/publish')
  publishJob(@Param('id') id: string) {
    // TODO: Implement logic for publishing
    return { id, published: true, message: 'Job published to careers site' };
  }

  /**
   * Apply to a job (REC-007)
   * Example payload: { jobId: string, candidate: { name, email, cvUrl, ... } }
   */
  @Post('applications')
  apply(@Body() applicationDto: any) {
    // TODO: Hand off to service
    return { message: 'Application received', app: applicationDto };
  }

  /**
   * Get status of an application (REC-017, REC-008)
   */
  @Get('applications/:id/status')
  getStatus(@Param('id') id: string) {
    // TODO: Fetch status from service
    return { id, status: 'interview', history: [{ stage: 'screening', at: new Date() }] };
  }

  /**
   * Update status of an application (REC-008, REC-022 for rejection)
   * Example payload: { status: string, comments?: string }
   */
  @Post('applications/:id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: any) {
    // TODO: Update logic / notification hooks
    return { id, newStatus: updateStatusDto.status, message: 'Status updated' };
  }

  /**
   * Notify candidate about a status update or rejection (REC-017, REC-022)
   * Example payload: { type: 'rejection'|'status', templateId?: string, reason?: string }
   */
  @Post('applications/:id/notify')
  notifyCandidate(@Param('id') id: string, @Body() notifyDto: any) {
    // TODO: Send email/alert
    return { id, notified: true, type: notifyDto.type, message: 'Candidate notified' };
  }

  /**
   * Schedule an interview (REC-010, REC-021)
   * Example payload: { applicationId, slot, panelMembers: [userId], mode }
   */
  @Post('interviews')
  scheduleInterview(@Body() interviewDto: any) {
    // TODO: Pass to service, calendar integration
    return { message: 'Interview scheduled', interview: interviewDto };
  }

  /**
   * Submit interview feedback/scoring (REC-011, REC-020)
   * Example payload: { rating, comments, criteria: [{ key, score }] }
   */
  @Post('interviews/:id/feedback')
  submitFeedback(@Param('id') id: string, @Body() feedbackDto: any) {
    // TODO: Store feedback/scoring
    return { id, submitted: true, feedback: feedbackDto };
  }

  /**
   * Get interview details (REC-010, REC-021)
   */
  @Get('interviews/:id')
  getInterview(@Param('id') id: string) {
    // TODO: fetch from service
    return { id, applicationId: 'app1', scheduledFor: new Date(), panel: ['user1'] };
  }

  /**
   * Fetch interview panel details (REC-021)
   */
  @Get('panels/:id')
  getPanel(@Param('id') id: string) {
    // TODO: fetch from service
    return { id, members: ['user1','user2'], scoringComplete: false };
  }

  /**
   * Tag candidate as referral (REC-030)
   * Example payload: { applicationId, referredBy, type: 'internal'|'external' }
   */
  @Post('referrals')
  tagReferral(@Body() referralDto: any) {
    // TODO: Store/retrieve in service
    return { message: 'Candidate tagged as referral', referral: referralDto };
  }

  /**
   * Recruitment analytics dashboard (REC-009)
   */
  @Get('analytics/recruitment')
  getRecruitmentAnalytics() {
    // TODO: Replace with service-side analytics
    return { jobOpenings: 3, candidates: 17, avgTimeToHire: '21d' };
  }

  /**
   * Save candidate consent (REC-028)
   * Example payload: { candidateId, consentType: 'data'|'background', granted: true }
   */
  @Post('consent')
  saveConsent(@Body() consentDto: any) {
    // TODO: Save consent
    return { message: 'Consent saved', consent: consentDto };
  }

  /**
   * Create offer letter / collect signature (REC-014, REC-018)
   * Example payload: { applicationId, templateId, compensation, benefits, signature }
   */
  @Post('offers')
  createOffer(@Body() offerDto: any) {
    // TODO: Store offer
    return { message: 'Offer created', offer: offerDto };
  }

  /**
   * Accept offer and trigger onboarding (REC-029)
   */
  @Post('offers/:id/accept')
  acceptOffer(@Param('id') id: string) {
    // TODO: Mark offer as accepted; begin onboarding
    return { id, accepted: true, onboardingTriggered: true };
  }
}
