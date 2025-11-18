import { Injectable } from '@nestjs/common';

@Injectable()
export class OnboardingService {
  getOnboardingChecklists() {
    // Returns sample onboarding checklists
    return [
      {
        checklistId: 'ONBCHK001',
        employeeId: 'EMP342',
        templateCode: 'DEV-2024',
        tasks: [
          {
            taskId: 'TASK1',
            title: 'Submit ID documents',
            responsible: 'newHire',
            status: 'completed',
            dueDate: new Date(),
            completedAt: new Date(),
            dependencies: [],
            reminders: []
          }
        ],
        documentsRequired: ['ID Card'],
        status: 'completed',
        startDate: new Date(),
        endDate: new Date(),
        provisioningPlanId: 'PROV-1'
      }
    ];
  }
}

