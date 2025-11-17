import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): string {
    return 'HR Recruitment/Onboarding/Offboarding API is running.';
  }

  // Example: recruitment endpoints
  @Get('recruitment/jobs')
  getAllJobs() { 
    return this.appService.getAllJobs(); 
  }

  // Example: onboarding endpoints
  @Get('onboarding/checklists')
  getOnboardingChecklists() { 
    return this.appService.getOnboardingChecklists(); 
  }

  // Example: offboarding endpoints
  @Get('offboarding/checklists')
  getOffboardingChecklists() { 
    return this.appService.getOffboardingChecklists(); 
  }
}
