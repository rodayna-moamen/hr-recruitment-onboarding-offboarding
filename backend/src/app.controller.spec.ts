import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "HR Recruitment/Onboarding/Offboarding API is running."', () => {
      expect(appController.getRoot()).toBe('HR Recruitment/Onboarding/Offboarding API is running.');
    });
  });
});

