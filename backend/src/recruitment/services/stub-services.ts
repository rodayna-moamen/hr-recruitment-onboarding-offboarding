import { Injectable } from '@nestjs/common';
import type { IOnboardingService } from '../interfaces/onboarding.interface';
import type { IEmployeeProfileService } from '../interfaces/employee-profile.interface';
import type { IOrganizationStructureService } from '../interfaces/organization-structure.interface';
import type { ITimeManagementService } from '../interfaces/time-management.interface';

/**
 * Stub services for standalone operation of the Recruitment module.
 * 
 * NOTE: Most services have been replaced with real implementations:
 * - OnboardingService: ✅ Real implementation (OnboardingService)
 * - EmployeeProfileService: ✅ Real implementation (EmployeeProfileServiceAdapter)
 * - OrganizationStructureService: ✅ Real implementation (OrganizationStructureServiceAdapter)
 * 
 * Remaining stubs:
 * - StubTimeManagementService: ⚠️ Still used (Time Management module doesn't have calendar methods yet)
 */
@Injectable()
export class StubOnboardingService implements IOnboardingService {
  async triggerOnboarding(
    candidateId: string,
    offerId: string,
    offerDetails: {
      role: string;
      department: string;
      grossSalary: number;
      signingBonus?: number;
      startDate?: Date;
      employeeId?: string;
      contractId?: string;
      contractDocumentId?: string;
      signedContractUrl?: string;
    },
  ): Promise<{ onboardingId: string; tasks: any[]; contractId: string }> {
    console.warn('StubOnboardingService.triggerOnboarding called - not implemented');
    return {
      onboardingId: 'stub-onboarding-id',
      contractId: offerDetails.contractId || 'stub-contract-id',
      tasks: [],
    };
  }
}

@Injectable()
export class StubEmployeeProfileService implements IEmployeeProfileService {
  async createEmployeeFromCandidate(
    candidateId: string,
    offerDetails: {
      fullName: string;
      email: string;
      role: string;
      department: string;
      startDate: Date;
    },
  ): Promise<{ employeeId: string }> {
    console.warn('StubEmployeeProfileService.createEmployeeFromCandidate called - not implemented');
    return { employeeId: 'stub-employee-id' };
  }

  async updateEmployeeStatus(employeeId: string, status: string): Promise<void> {
    console.warn(`StubEmployeeProfileService.updateEmployeeStatus called - not implemented. Would update employee ${employeeId} to status ${status}`);
  }
}

@Injectable()
export class StubOrganizationStructureService implements IOrganizationStructureService {
  async validateDepartment(departmentId: string): Promise<boolean> {
    console.warn('StubOrganizationStructureService.validateDepartment called - not implemented');
    return true; // Stub always returns true
  }

  async getDepartment(departmentId: string): Promise<{ id: string; name: string; managerId?: string } | null> {
    console.warn('StubOrganizationStructureService.getDepartment called - not implemented');
    return { id: departmentId, name: 'Stub Department' };
  }
}

/**
 * Stub Time Management Service
 * 
 * NOTE: Time Management module exists but doesn't have calendar event methods yet.
 * This stub provides the interface until Time Management module implements:
 * - createCalendarEvent()
 * - checkAvailability()
 * - sendCalendarInvite()
 * 
 * When Time Management module adds these methods, create a TimeManagementServiceAdapter
 * similar to EmployeeProfileServiceAdapter and OrganizationStructureServiceAdapter.
 */
@Injectable()
export class StubTimeManagementService implements ITimeManagementService {
  async createCalendarEvent(eventDetails: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    location?: string;
    videoLink?: string;
  }): Promise<{ eventId: string; calendarLink?: string }> {
    // Log the calendar event creation request
    console.log(`[STUB] Calendar event creation requested: ${eventDetails.title}`);
    console.log(`[STUB] Start: ${eventDetails.startTime}, End: ${eventDetails.endTime}`);
    console.log(`[STUB] Attendees: ${eventDetails.attendees.length} panel members`);
    
    // Return stub event ID (in production, this would create actual calendar event)
    return {
      eventId: `CAL-${Date.now()}`,
      calendarLink: `https://calendar.example.com/event/${Date.now()}`,
    };
  }

  async checkAvailability(
    employeeIds: string[],
    startTime: Date,
    endTime: Date,
  ): Promise<Array<{ employeeId: string; available: boolean; conflicts?: any[] }>> {
    // Log availability check request
    console.log(`[STUB] Availability check requested for ${employeeIds.length} employees`);
    console.log(`[STUB] Time slot: ${startTime} to ${endTime}`);
    
    // Return all as available (in production, this would check actual calendar conflicts)
    return employeeIds.map(id => ({ 
      employeeId: id, 
      available: true,
      conflicts: [], // No conflicts in stub
    }));
  }

  async sendCalendarInvite(eventId: string, attendeeEmails: string[]): Promise<void> {
    // Log calendar invite request
    console.log(`[STUB] Calendar invite requested for event ${eventId}`);
    console.log(`[STUB] Sending invites to ${attendeeEmails.length} attendees`);
    
    // In production, this would send actual iCal invites via email
    attendeeEmails.forEach(email => {
      console.log(`[STUB] Would send calendar invite to: ${email}`);
    });
  }
}

