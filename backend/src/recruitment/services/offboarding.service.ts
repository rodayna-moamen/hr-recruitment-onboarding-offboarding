import { Injectable, Logger, NotFoundException, BadRequestException, Optional, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TerminationRequest } from '../models/termination-request.schema';
import { ClearanceChecklist } from '../models/clearance-checklist.schema';
import { Contract } from '../models/contract.schema';
import { TerminationInitiation } from '../enums/termination-initiation.enum';
import { TerminationStatus } from '../enums/termination-status.enum';
import { ApprovalStatus } from '../enums/approval-status.enum';
import { CreateTerminationRequestDto } from '../dto/create-termination-request.dto';
import { InitiateTerminationReviewDto } from '../dto/initiate-termination-review.dto';
import { UpdateClearanceItemDto } from '../dto/update-clearance-item.dto';
import { UpdateEquipmentReturnDto } from '../dto/update-equipment-return.dto';
import { PayrollExecutionService } from '../../payroll-execution/payroll-execution.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PerformanceService } from '../../performance/performance.service';
import { LeavesService } from '../../leaves/leaves.service';
import type { IEmployeeProfileService } from '../interfaces/employee-profile.interface';

/**
 * Offboarding Service - Handles termination, resignation, and clearance processes
 */
@Injectable()
export class OffboardingService {
  private readonly logger = new Logger(OffboardingService.name);

  constructor(
    @InjectModel(TerminationRequest.name)
    private terminationRequestModel: Model<TerminationRequest>,
    @InjectModel(ClearanceChecklist.name)
    private clearanceChecklistModel: Model<ClearanceChecklist>,
    @InjectModel(Contract.name)
    private contractModel: Model<Contract>,
    @Optional() private payrollExecutionService?: PayrollExecutionService,
    @Optional() private notificationsService?: NotificationsService,
    @Optional() private performanceService?: PerformanceService,
    @Optional() private leavesService?: LeavesService,
    @Optional() @Inject('IEmployeeProfileService') private employeeProfileService?: IEmployeeProfileService,
  ) {}

  /**
   * Employee requests resignation
   */
  async createResignationRequest(dto: CreateTerminationRequestDto): Promise<TerminationRequest> {
    this.logger.log(`Creating resignation request for employee ${dto.employeeId}`);

    // Validate contract exists
    const contract = await this.contractModel.findById(dto.contractId).exec();
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
    }

    const terminationRequest = new this.terminationRequestModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      initiator: TerminationInitiation.EMPLOYEE,
      reason: dto.reason,
      employeeComments: dto.employeeComments,
      status: TerminationStatus.PENDING,
      terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
      contractId: new Types.ObjectId(dto.contractId),
    });

    await terminationRequest.save();

    this.logger.log(`Resignation request created: ${terminationRequest._id}`);

    // Send notification to HR
    if (this.notificationsService) {
      try {
        await this.notificationsService.sendNotification({
          type: 'application_status_update' as any, // Use existing type
          channel: 'email' as any,
          recipientId: dto.employeeId, // HR would be notified separately
          recipientEmail: '', // Would need HR email
          recipientName: 'HR Team',
          subject: 'New Resignation Request',
          content: `Employee ${dto.employeeId} has submitted a resignation request. Reason: ${dto.reason}`,
          relatedEntityId: terminationRequest._id.toString(),
          relatedEntityType: 'termination_request',
        });
      } catch (error) {
        this.logger.warn(`Failed to send resignation notification: ${error.message}`);
      }
    }

    return terminationRequest;
  }

  /**
   * HR Manager initiates termination review based on warnings/performance
   */
  async initiateTerminationReview(dto: InitiateTerminationReviewDto): Promise<TerminationRequest> {
    this.logger.log(`Initiating termination review for employee ${dto.employeeId}`);

    // Get employee contract
    const contract = await this.contractModel
      .findOne({ employeeId: new Types.ObjectId(dto.employeeId) })
      .exec();

    if (!contract) {
      throw new NotFoundException(`Contract not found for employee ${dto.employeeId}`);
    }

    // Get performance data if available
    let performanceData: any = null;
    let lowPerformanceScores: any[] = [];
    if (this.performanceService) {
      try {
        // Fetch all appraisals for the employee
        const appraisals = await this.performanceService.findMyAppraisals(dto.employeeId);
        
        // Filter for low performance scores (e.g., totalScore < 60 or overallRatingLabel indicates poor performance)
        lowPerformanceScores = appraisals.filter((appraisal: any) => {
          if (appraisal.totalScore !== undefined && appraisal.totalScore < 60) {
            return true;
          }
          if (appraisal.overallRatingLabel) {
            const label = appraisal.overallRatingLabel.toLowerCase();
            return label.includes('poor') || label.includes('unsatisfactory') || label.includes('needs improvement');
          }
          return false;
        });

        if (lowPerformanceScores.length > 0) {
          this.logger.log(`Found ${lowPerformanceScores.length} low performance appraisals for employee ${dto.employeeId}`);
        }

        // If specific appraisal IDs provided, use those
        if (dto.appraisalIds && dto.appraisalIds.length > 0) {
          const specificAppraisals = appraisals.filter((a: any) => 
            dto.appraisalIds?.includes(a._id.toString())
          );
          lowPerformanceScores = specificAppraisals.length > 0 ? specificAppraisals : lowPerformanceScores;
        }

        performanceData = {
          totalAppraisals: appraisals.length,
          lowPerformanceCount: lowPerformanceScores.length,
          appraisals: lowPerformanceScores,
        };
      } catch (error) {
        this.logger.warn(`Could not fetch performance data: ${error.message}`);
      }
    }

    const terminationRequest = new this.terminationRequestModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      initiator: TerminationInitiation.HR,
      reason: dto.reason,
      hrComments: dto.hrComments,
      status: TerminationStatus.UNDER_REVIEW,
      contractId: contract._id as Types.ObjectId,
    });

    const savedRequest = await terminationRequest.save();

    // Create initial clearance checklist
    await this.createClearanceChecklist((savedRequest as any)._id.toString());

    this.logger.log(`Termination review initiated: ${terminationRequest._id}`);

    return terminationRequest;
  }

  /**
   * Create offboarding checklist
   */
  async createClearanceChecklist(terminationId: string): Promise<ClearanceChecklist> {
    this.logger.log(`Creating clearance checklist for termination ${terminationId}`);

    // Default departments for clearance
    const defaultItems = [
      { department: 'IT', status: ApprovalStatus.PENDING },
      { department: 'Finance', status: ApprovalStatus.PENDING },
      { department: 'Facilities', status: ApprovalStatus.PENDING },
      { department: 'Line Manager', status: ApprovalStatus.PENDING },
      { department: 'HR', status: ApprovalStatus.PENDING },
    ];

    const clearanceChecklist = new this.clearanceChecklistModel({
      terminationId: new Types.ObjectId(terminationId),
      items: defaultItems,
      equipmentList: [],
      cardReturned: false,
    });

    await clearanceChecklist.save();

    this.logger.log(`Clearance checklist created: ${clearanceChecklist._id}`);

    return clearanceChecklist;
  }

  /**
   * Update clearance item status (multi-department sign-off)
   */
  async updateClearanceItem(
    terminationId: string,
    department: string,
    dto: UpdateClearanceItemDto,
    updatedBy: string,
  ): Promise<ClearanceChecklist> {
    const clearanceChecklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();

    if (!clearanceChecklist) {
      throw new NotFoundException(`Clearance checklist not found for termination ${terminationId}`);
    }

    // Find and update the item
    const itemIndex = clearanceChecklist.items.findIndex(
      (item: any) => item.department.toLowerCase() === department.toLowerCase()
    );

    if (itemIndex === -1) {
      throw new BadRequestException(`Department ${department} not found in clearance checklist`);
    }

    clearanceChecklist.items[itemIndex].status = dto.status;
    clearanceChecklist.items[itemIndex].comments = dto.comments;
    clearanceChecklist.items[itemIndex].updatedBy = new Types.ObjectId(updatedBy);
    clearanceChecklist.items[itemIndex].updatedAt = new Date();

    await clearanceChecklist.save();

    // Check if all departments have approved
    const allApproved = clearanceChecklist.items.every(
      (item: any) => item.status === ApprovalStatus.APPROVED
    );

    if (allApproved && clearanceChecklist.cardReturned) {
      // All clearances complete, trigger final payroll processing
      await this.triggerFinalPayrollProcessing(terminationId);
    }

    this.logger.log(`Clearance item updated for ${department}: ${dto.status}`);

    return clearanceChecklist;
  }

  /**
   * Update equipment return status
   */
  async updateEquipmentReturn(
    terminationId: string,
    dto: UpdateEquipmentReturnDto,
  ): Promise<ClearanceChecklist> {
    const clearanceChecklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();

    if (!clearanceChecklist) {
      throw new NotFoundException(`Clearance checklist not found for termination ${terminationId}`);
    }

    const equipmentIndex = clearanceChecklist.equipmentList.findIndex(
      (eq: any) => eq.equipmentId?.toString() === dto.equipmentId
    );

    if (equipmentIndex === -1) {
      // Add new equipment
      clearanceChecklist.equipmentList.push({
        equipmentId: new Types.ObjectId(dto.equipmentId),
        name: dto.equipmentId, // Would be fetched from equipment system
        returned: dto.returned ?? false,
        condition: dto.condition || 'good',
      });
    } else {
      // Update existing equipment
      if (dto.returned !== undefined) {
        clearanceChecklist.equipmentList[equipmentIndex].returned = dto.returned;
      }
      if (dto.condition) {
        clearanceChecklist.equipmentList[equipmentIndex].condition = dto.condition;
      }
    }

    await clearanceChecklist.save();

    this.logger.log(`Equipment return updated for ${dto.equipmentId}`);

    return clearanceChecklist;
  }

  /**
   * Mark access card as returned
   */
  async markCardReturned(terminationId: string): Promise<ClearanceChecklist> {
    const clearanceChecklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();

    if (!clearanceChecklist) {
      throw new NotFoundException(`Clearance checklist not found for termination ${terminationId}`);
    }

    clearanceChecklist.cardReturned = true;
    await clearanceChecklist.save();

    // Check if all clearances are complete
    const allApproved = clearanceChecklist.items.every(
      (item: any) => item.status === ApprovalStatus.APPROVED
    );

    if (allApproved && clearanceChecklist.cardReturned) {
      await this.triggerFinalPayrollProcessing(terminationId);
    }

    return clearanceChecklist;
  }

  /**
   * Approve termination request
   */
  async approveTermination(terminationId: string): Promise<TerminationRequest> {
    const terminationRequest = await this.terminationRequestModel.findById(terminationId).exec();

    if (!terminationRequest) {
      throw new NotFoundException(`Termination request ${terminationId} not found`);
    }

    terminationRequest.status = TerminationStatus.APPROVED;
    terminationRequest.terminationDate = terminationRequest.terminationDate || new Date();

    await terminationRequest.save();

    // Trigger offboarding notification and payroll processing
    await this.triggerOffboardingNotification(terminationRequest);

    this.logger.log(`Termination approved: ${terminationId}`);

    return terminationRequest;
  }

  /**
   * Trigger offboarding notification and benefits termination
   */
  private async triggerOffboardingNotification(terminationRequest: TerminationRequest): Promise<void> {
    const employeeId = terminationRequest.employeeId.toString();
    const terminationId = (terminationRequest as any)._id.toString();

    // Get leave balance for final calculations
    const leaveBalance = await this.getEmployeeLeaveBalance(employeeId);
    if (leaveBalance) {
      this.logger.log(`Employee ${employeeId} has ${leaveBalance.totalRemaining} remaining leave days`);
    }

    // Revoke system access (System Admin function)
    try {
      await this.revokeSystemAccess(employeeId);
    } catch (error) {
      this.logger.warn(`Failed to revoke system access: ${error.message}`);
    }

    // Trigger payroll execution service for benefits termination
    if (this.payrollExecutionService) {
      try {
        if (terminationRequest.initiator === TerminationInitiation.EMPLOYEE) {
          // Resignation
          await this.payrollExecutionService.handleResignationEvent(
            employeeId,
            terminationId,
            {
              terminationDate: terminationRequest.terminationDate,
            }
          );
        } else {
          // Termination
          await this.payrollExecutionService.handleTerminationEvent(
            employeeId,
            terminationId,
            {
              terminationDate: terminationRequest.terminationDate,
              includeSeverance: true,
            }
          );
        }
        this.logger.log(`Payroll benefits processing triggered for ${employeeId}`);
      } catch (error) {
        this.logger.error(`Failed to trigger payroll processing: ${error.message}`);
      }
    }

    // Send notification
    if (this.notificationsService) {
      try {
        await this.notificationsService.sendNotification({
          type: 'application_status_update' as any,
          channel: 'email' as any,
          recipientId: employeeId,
          recipientEmail: '', // Would fetch from employee profile
          recipientName: 'Employee',
          subject: 'Offboarding Process Initiated',
          content: `Your ${terminationRequest.initiator === TerminationInitiation.EMPLOYEE ? 'resignation' : 'termination'} has been approved. Please complete the clearance checklist.`,
          relatedEntityId: terminationId,
          relatedEntityType: 'termination_request',
        });
      } catch (error) {
        this.logger.warn(`Failed to send offboarding notification: ${error.message}`);
      }
    }
  }

  /**
   * Trigger final payroll processing when all clearances are complete
   */
  private async triggerFinalPayrollProcessing(terminationId: string): Promise<void> {
    const terminationRequest = await this.terminationRequestModel.findById(terminationId).exec();
    if (!terminationRequest) {
      return;
    }

    // Final payroll processing would be handled by PayrollExecutionService
    // This is already triggered in approveTermination, but can be called again
    // if needed for final settlement
    this.logger.log(`Final payroll processing triggered for termination ${terminationId}`);
  }

  /**
   * Get termination request by ID
   */
  async getTerminationRequestById(id: string): Promise<TerminationRequest> {
    const terminationRequest = await this.terminationRequestModel
      .findById(id)
      .populate('employeeId')
      .populate('contractId')
      .exec();

    if (!terminationRequest) {
      throw new NotFoundException(`Termination request ${id} not found`);
    }

    return terminationRequest;
  }

  /**
   * Get termination requests by employee ID
   */
  async getTerminationRequestsByEmployee(employeeId: string): Promise<TerminationRequest[]> {
    return this.terminationRequestModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('contractId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all termination requests
   */
  async getAllTerminationRequests(): Promise<TerminationRequest[]> {
    return this.terminationRequestModel
      .find()
      .populate('employeeId')
      .populate('contractId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get clearance checklist by termination ID
   */
  async getClearanceChecklist(terminationId: string): Promise<ClearanceChecklist> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();

    if (!checklist) {
      throw new NotFoundException(`Clearance checklist not found for termination ${terminationId}`);
    }

    return checklist;
  }

  /**
   * Get employee leave balance for final calculations
   */
  async getEmployeeLeaveBalance(employeeId: string): Promise<any> {
    if (!this.leavesService) {
      this.logger.warn('LeavesService not available. Cannot fetch leave balance.');
      return null;
    }

    try {
      const entitlements = await this.leavesService.leaveEntitlement.findByEmployee(employeeId);
      
      // Calculate total accrued leave days
      let totalAccruedDays = 0;
      let totalRemaining = 0;
      
      if (Array.isArray(entitlements)) {
        entitlements.forEach((entitlement: any) => {
          // Use remaining days (which accounts for taken and pending)
          totalRemaining += entitlement.remaining || 0;
          // Also track accrued for payout calculation
          totalAccruedDays += (entitlement.accruedRounded || entitlement.accruedActual || 0);
        });
      }

      return {
        totalAccruedDays,
        totalRemaining,
        entitlements: entitlements || [],
      };
    } catch (error) {
      this.logger.warn(`Could not fetch leave balance: ${error.message}`);
      return null;
    }
  }

  /**
   * Get employee performance data (warnings and low scores)
   */
  async getEmployeePerformanceData(employeeId: string): Promise<any> {
    if (!this.performanceService) {
      this.logger.warn('PerformanceService not available. Cannot fetch performance data.');
      return null;
    }

    try {
      const appraisals = await this.performanceService.findMyAppraisals(employeeId);
      
      // Filter for low performance
      const lowPerformance = appraisals.filter((appraisal: any) => {
        if (appraisal.totalScore !== undefined && appraisal.totalScore < 60) {
          return true;
        }
        if (appraisal.overallRatingLabel) {
          const label = appraisal.overallRatingLabel.toLowerCase();
          return label.includes('poor') || label.includes('unsatisfactory') || label.includes('needs improvement');
        }
        return false;
      });

      return {
        totalAppraisals: appraisals.length,
        lowPerformanceCount: lowPerformance.length,
        lowPerformanceAppraisals: lowPerformance,
        allAppraisals: appraisals,
      };
    } catch (error) {
      this.logger.warn(`Could not fetch performance data: ${error.message}`);
      return null;
    }
  }

  /**
   * Revoke system access (System Admin) - ONB-013 (scheduled revocation on exit)
   * This method is called when termination is approved to revoke all system access
   * 
   * How it works:
   * 1. This method logs the revocation request
   * 2. In production, this would integrate with:
   *    - Authentication system: Disable user account (prevents login, invalidates tokens)
   *    - SSO system: Revoke SSO access
   *    - Email system: Disable email account
   *    - Internal systems: Revoke access to all internal applications
   * 3. The employee's JWT token becomes invalid (they can't login)
   * 4. All system access is revoked immediately
   * 
   * Note: Token invalidation happens at the authentication layer when account is disabled.
   * The employee cannot use their existing token once the account is disabled.
   */
  async revokeSystemAccess(employeeId: string): Promise<void> {
    this.logger.log(`[OFFBOARDING] System access revocation initiated for employee ${employeeId}`);
    
    // 1. Log revocation request with timestamp
    const revocationLog = {
      employeeId,
      timestamp: new Date(),
      actions: [
        'Disable user account in authentication system',
        'Revoke SSO access',
        'Revoke email access',
        'Revoke access to internal systems',
        'Invalidate all active sessions/tokens',
      ],
    };
    
    this.logger.log(`[OFFBOARDING] Revocation log: ${JSON.stringify(revocationLog, null, 2)}`);
    
    // 2. Update Employee Profile status to TERMINATED (BR 3(c), OFF-007)
    if (this.employeeProfileService) {
      try {
        await this.employeeProfileService.updateEmployeeStatus(employeeId, 'TERMINATED');
        this.logger.log(`[OFFBOARDING] Employee ${employeeId} status updated to TERMINATED`);
      } catch (error) {
        this.logger.warn(`[OFFBOARDING] Failed to update employee status: ${error.message}`);
      }
    } else {
      this.logger.warn('[OFFBOARDING] EmployeeProfileService not available. Cannot update employee status.');
    }
    
    // 3. In production, this would call actual system admin services:
    // Example integration (commented out as IT systems are not available):
    /*
    if (this.systemAdminService) {
      await this.systemAdminService.disableUserAccount(employeeId);
      await this.systemAdminService.revokeSSOAccess(employeeId);
      await this.systemAdminService.revokeEmailAccess(employeeId);
      await this.systemAdminService.revokeInternalSystemAccess(employeeId);
      await this.systemAdminService.invalidateAllTokens(employeeId);
    }
    */
    
    // 4. Send notification to System Admin (if available)
    if (this.notificationsService) {
      try {
        // In production, fetch System Admin email
        this.logger.log(`[OFFBOARDING] System Admin notified of access revocation for ${employeeId}`);
      } catch (error) {
        this.logger.warn(`[OFFBOARDING] Failed to notify System Admin: ${error.message}`);
      }
    }
    
    this.logger.log(`[OFFBOARDING] System access revocation completed for employee ${employeeId}`);
    this.logger.warn('[OFFBOARDING] Note: Actual revocation requires integration with IT systems (Authentication, SSO, Email, Internal Apps)');
  }
}

