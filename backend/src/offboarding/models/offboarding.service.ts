import { Injectable } from '@nestjs/common';

@Injectable()
export class OffboardingService {
  getOffboardingChecklists() {
    // Returns sample offboarding checklists
    return [
      {
        checklistId: 'OFFCHK123',
        employeeId: 'EMP342',
        exitType: 'resignation',
        tasks: [
          {
            taskId: 'TASK-X1',
            title: 'Return Laptop',
            department: 'IT',
            status: 'pending',
            dueDate: new Date(),
          },
        ],
        assetReturnPlanId: 'ASSET42',
        clearanceSignOffId: 'CLS42',
        finalSettlementId: 'FS-99'
      }
    ];
  }
}

