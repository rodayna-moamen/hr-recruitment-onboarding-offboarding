import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // Job Postings CRUD
  @Get('jobs')
  getAllJobs() {
    return this.recruitmentService.getAllJobs();
  }

  @Get('jobs/:postingId')
  getJobById(@Param('postingId') postingId: string) {
    return this.recruitmentService.getJobById(postingId);
  }

  @Post('jobs')
  createJob(@Body() jobData: any) {
    return this.recruitmentService.createJob(jobData);
  }

  @Put('jobs/:postingId')
  updateJob(@Param('postingId') postingId: string, @Body() jobData: any) {
    return this.recruitmentService.updateJob(postingId, jobData);
  }

  @Delete('jobs/:postingId')
  deleteJob(@Param('postingId') postingId: string) {
    return this.recruitmentService.deleteJob(postingId);
  }

  // Applications CRUD
  @Get('applications')
  getAllApplications() {
    return this.recruitmentService.getAllApplications();
  }

  @Get('applications/:applicationId')
  getApplicationById(@Param('applicationId') applicationId: string) {
    return this.recruitmentService.getApplicationById(applicationId);
  }

  @Post('applications')
  createApplication(@Body() applicationData: any) {
    return this.recruitmentService.createApplication(applicationData);
  }

  // Candidates CRUD
  @Get('candidates')
  getAllCandidates() {
    return this.recruitmentService.getAllCandidates();
  }

  @Get('candidates/:candidateId')
  getCandidateById(@Param('candidateId') candidateId: string) {
    return this.recruitmentService.getCandidateById(candidateId);
  }

  @Post('candidates')
  createCandidate(@Body() candidateData: any) {
    return this.recruitmentService.createCandidate(candidateData);
  }

  // Offers CRUD
  @Get('offers')
  getAllOffers() {
    return this.recruitmentService.getAllOffers();
  }

  @Get('offers/:offerId')
  getOfferById(@Param('offerId') offerId: string) {
    return this.recruitmentService.getOfferById(offerId);
  }

  @Post('offers')
  createOffer(@Body() offerData: any) {
    return this.recruitmentService.createOffer(offerData);
  }

  // Interviews CRUD
  @Get('interviews')
  getAllInterviews() {
    return this.recruitmentService.getAllInterviews();
  }

  @Get('interviews/:interviewId')
  getInterviewById(@Param('interviewId') interviewId: string) {
    return this.recruitmentService.getInterviewById(interviewId);
  }

  @Post('interviews')
  createInterview(@Body() interviewData: any) {
    return this.recruitmentService.createInterview(interviewData);
  }
}

