import { Controller, Get } from '@nestjs/common';
import { OffboardingService } from './offboarding.service';

@Controller('offboarding')
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}

  @Get('checklists')
  getOffboardingChecklists() {
    return this.offboardingService.getOffboardingChecklists();
  }
}

