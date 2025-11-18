import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Recruitment business logic placeholder
  getAllJobs() {
    // Returns sample job postings
    return [
      {
        postingId: 'JP123',
        requisitionId: 'REQ001',
        templateId: 'TEMPL42',
        channel: 'external',
        status: 'published',
        branding: {
          heroTitle: 'Join Our Team!',
          employerValueProps: ['Great culture', 'Health insurance'],
          mediaAssets: ['img1.jpg'],
          footerText: 'Be part of our success.'
        },
        previewUrl: 'https://careers.example.com/jobs/JP123',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000*60*60*24*30), // 30 days later
        seo: {
          slug: 'software-engineer',
          keywords: ['typescript','node.js','backend'],
          metaDescription: 'Hiring software engineers.'
        }
      }
    ];
  }

  // Onboarding business logic placeholder
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

  // Offboarding business logic placeholder
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
