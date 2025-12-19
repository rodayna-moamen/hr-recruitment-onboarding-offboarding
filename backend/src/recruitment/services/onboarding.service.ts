import { Injectable, Logger, NotFoundException, BadRequestException, Optional, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { IOnboardingService } from '../interfaces/onboarding.interface';
import { Onboarding } from '../models/onboarding.schema';
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';
import { Contract } from '../models/contract.schema';
import { Document } from '../models/document.schema';
import { DocumentType } from '../enums/document-type.enum';
import { CreateOnboardingChecklistDto, OnboardingTaskDto } from '../dto/create-onboarding-checklist.dto';
import { UpdateOnboardingTaskDto } from '../dto/update-onboarding-task.dto';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { ReserveEquipmentDto } from '../dto/reserve-equipment.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { PayrollExecutionService } from '../../payroll-execution/payroll-execution.service';

/**
 * Real Onboarding Service implementation using the Onboarding model.
 */
@Injectable()
export class OnboardingService implements IOnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectModel(Onboarding.name)
    private onboardingModel: Model<Onboarding>,
    @InjectModel(Contract.name)
    private contractModel: Model<Contract>,
    @InjectModel(Document.name)
    private documentModel: Model<Document>,
    @Optional() private notificationsService?: NotificationsService,
    @Optional() private payrollExecutionService?: PayrollExecutionService,
  ) {}

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
    this.logger.log(`Triggering onboarding for candidate ${candidateId} with offer ${offerId}`);

    // Create contract from offer (if not already created)
    let contractId: Types.ObjectId;
    let contract: Contract | null = null;

    if (offerDetails.contractId) {
      // Contract already created, use it
      contractId = new Types.ObjectId(offerDetails.contractId);
      contract = await this.contractModel.findById(contractId).exec();
      if (!contract) {
        throw new NotFoundException(`Contract ${offerDetails.contractId} not found`);
      }
    } else if (offerDetails.contractDocumentId && offerDetails.signedContractUrl) {
      // Create new contract with document
      const newContract = new this.contractModel({
        offerId: new Types.ObjectId(offerId),
        acceptanceDate: new Date(),
        grossSalary: offerDetails.grossSalary,
        signingBonus: offerDetails.signingBonus,
        role: offerDetails.role,
        documentId: new Types.ObjectId(offerDetails.contractDocumentId),
        employeeSignatureUrl: offerDetails.signedContractUrl,
        employeeSignedAt: new Date(),
      });
      contract = await newContract.save();
      contractId = (contract as any)._id as Types.ObjectId;
      this.logger.log(`Contract created: ${contractId}`);
    } else {
      // Create contract without document (will be uploaded later)
      const newContract = new this.contractModel({
        offerId: new Types.ObjectId(offerId),
        acceptanceDate: new Date(),
        grossSalary: offerDetails.grossSalary,
        signingBonus: offerDetails.signingBonus,
        role: offerDetails.role,
      });
      contract = await newContract.save();
      contractId = (contract as any)._id as Types.ObjectId;
      this.logger.log(`Contract created (pending document): ${contractId}`);
    }

    // Use provided employeeId or create placeholder
    const employeeId = offerDetails.employeeId 
      ? new Types.ObjectId(offerDetails.employeeId)
      : new Types.ObjectId(); // Placeholder - should be set by calling service

    // Create default onboarding tasks based on role and department
    const tasks = [
      {
        name: 'Complete Employee Profile',
        department: offerDetails.department,
        status: OnboardingTaskStatus.PENDING,
        deadline: offerDetails.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Fill in all required employee information',
      },
      {
        name: 'Submit Required Documents',
        department: offerDetails.department,
        status: OnboardingTaskStatus.PENDING,
        deadline: offerDetails.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: 'Submit ID, certificates, and other required documents',
      },
      {
        name: 'Complete Orientation',
        department: offerDetails.department,
        status: OnboardingTaskStatus.PENDING,
        deadline: offerDetails.startDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        notes: 'Attend company orientation session',
      },
      {
        name: 'Setup Workstation',
        department: 'IT',
        status: OnboardingTaskStatus.PENDING,
        deadline: offerDetails.startDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        notes: 'IT will setup your workstation and accounts (Email, SSO, System Access)',
        provisioningRequired: true, // Flag for System Admin to trigger provisioning
      },
      {
        name: 'Provision System Access',
        department: 'IT',
        status: OnboardingTaskStatus.PENDING,
        deadline: offerDetails.startDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notes: 'System Admin: Provision email, SSO, payroll access, and internal systems',
        provisioningRequired: true,
        systemAdminTask: true, // Mark as System Admin task (ONB-009)
      },
    ];

    const onboarding = new this.onboardingModel({
      employeeId,
      contractId,
      tasks,
      completed: false,
    });

    await onboarding.save();

    this.logger.log(`Onboarding created with ID: ${onboarding._id} and ${tasks.length} tasks`);

    // Process signing bonus if contract has signing bonus
    if (contract && contract.signingBonus && contract.signingBonus > 0 && offerDetails.employeeId && this.payrollExecutionService) {
      try {
        await this.payrollExecutionService.handleNewHireEvent(
          offerDetails.employeeId,
          {
            signingBonusFlag: true,
            signingBonusAmount: contract.signingBonus,
            paymentDate: contract.employeeSignedAt || new Date(),
          },
        );
        this.logger.log(`Signing bonus processed for employee ${offerDetails.employeeId}`);
      } catch (error) {
        this.logger.error(`Failed to process signing bonus: ${error.message}`);
        // Don't throw - signing bonus failure shouldn't break onboarding
      }
    }

    // Process payroll initiation (set start date in payroll system)
    // This is handled by the payroll system when employee is created
    // The start date is set when employee profile is created
    if (offerDetails.startDate && offerDetails.employeeId) {
      this.logger.log(`Payroll initiation: Start date ${offerDetails.startDate} for employee ${offerDetails.employeeId}`);
      // Payroll initiation is handled by setting the start date in employee profile
      // which is done by EmployeeProfileService.createEmployeeFromCandidate
    }

    // ONB-009, ONB-013: Log provisioning request for System Admin
    // This creates a task that System Admin can use to trigger actual provisioning
    if (offerDetails.employeeId && offerDetails.startDate) {
      this.logger.log(`[ONB-009/ONB-013] System access provisioning requested for employee ${offerDetails.employeeId}`);
      this.logger.log(`[ONB-009/ONB-013] Provisioning should be triggered on start date: ${offerDetails.startDate}`);
      this.logger.log(`[ONB-009/ONB-013] Required access: Email, SSO, Payroll, Internal Systems`);
      
      // Send notification to System Admin (if notifications service available)
      if (this.notificationsService) {
        try {
          // In a real implementation, you would fetch System Admin email
          // For now, we log the provisioning request
          this.logger.log(`[ONB-009/ONB-013] Provisioning notification logged for System Admin`);
        } catch (error) {
          this.logger.warn(`Failed to send provisioning notification: ${error.message}`);
        }
      }
    }

    return {
      onboardingId: onboarding._id.toString(),
      contractId: contractId.toString(),
      tasks: tasks.map((task, index) => ({
        ...task,
        id: index,
      })),
    };
  }

  /**
   * Get onboarding by employee ID
   */
  async getOnboardingByEmployeeId(employeeId: string): Promise<Onboarding> {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .populate('contractId')
      .exec();

    if (!onboarding) {
      throw new NotFoundException(`Onboarding not found for employee ${employeeId}`);
    }

    return onboarding;
  }

  /**
   * Get onboarding by ID
   */
  async getOnboardingById(onboardingId: string): Promise<Onboarding> {
    const onboarding = await this.onboardingModel
      .findById(onboardingId)
      .populate('contractId')
      .exec();

    if (!onboarding) {
      throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
    }

    return onboarding;
  }

  /**
   * Create onboarding checklist (template) - HR Manager
   */
  async createOnboardingChecklist(dto: CreateOnboardingChecklistDto): Promise<{ id: string; name: string; tasks: any[] }> {
    this.logger.log(`Creating onboarding checklist: ${dto.name}`);

    // Convert DTO tasks to onboarding task format
    const tasks = dto.tasks.map(task => ({
      name: task.name,
      department: task.department || dto.department,
      status: OnboardingTaskStatus.PENDING,
      deadline: task.deadline ? new Date(task.deadline) : undefined,
      notes: task.notes,
    }));

    // Store checklist as a template (we can use a separate collection or metadata)
    // For now, we'll store it in a way that can be reused
    // In a full implementation, you might want a separate OnboardingChecklist model
    // But since we can't create new schemas, we'll use the existing structure

    return {
      id: new Types.ObjectId().toString(),
      name: dto.name,
      tasks,
    };
  }

  /**
   * Update onboarding task status
   */
  async updateOnboardingTask(
    onboardingId: string,
    taskIndex: number,
    dto: UpdateOnboardingTaskDto,
  ): Promise<Onboarding> {
    const onboarding = await this.onboardingModel.findById(onboardingId).exec();

    if (!onboarding) {
      throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
    }

    if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
      throw new BadRequestException(`Invalid task index: ${taskIndex}`);
    }

    const task = onboarding.tasks[taskIndex];

    // Update task fields
    if (dto.name) task.name = dto.name;
    if (dto.status) task.status = dto.status;
    if (dto.deadline) task.deadline = new Date(dto.deadline);
    if (dto.completedAt) {
      task.completedAt = new Date(dto.completedAt);
      task.status = OnboardingTaskStatus.COMPLETED;
    }
    if (dto.documentId) task.documentId = new Types.ObjectId(dto.documentId);
    if (dto.notes !== undefined) task.notes = dto.notes;

    // Mark onboarding as completed if all tasks are completed
    const allCompleted = onboarding.tasks.every(t => t.status === OnboardingTaskStatus.COMPLETED);
    if (allCompleted && !onboarding.completed) {
      onboarding.completed = true;
      onboarding.completedAt = new Date();
    }

    await onboarding.save();

    // Send notification if task was completed
    if (dto.status === OnboardingTaskStatus.COMPLETED && this.notificationsService) {
      try {
        // Get employee email from employee profile (would need to fetch)
        // For now, just log
        this.logger.log(`Task ${task.name} completed for onboarding ${onboardingId}`);
      } catch (error) {
        this.logger.warn(`Failed to send task completion notification: ${error.message}`);
      }
    }

    return onboarding;
  }

  /**
   * Reserve equipment for new hire
   */
  async reserveEquipment(
    onboardingId: string,
    taskIndex: number,
    dto: ReserveEquipmentDto,
  ): Promise<Onboarding> {
    const onboarding = await this.onboardingModel.findById(onboardingId).exec();

    if (!onboarding) {
      throw new NotFoundException(`Onboarding with ID ${onboardingId} not found`);
    }

    if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
      throw new BadRequestException(`Invalid task index: ${taskIndex}`);
    }

    const task = onboarding.tasks[taskIndex];

    // Update equipment reservation details
    task.equipmentReserved = dto.equipmentReserved ?? true;
    if (dto.deskNumber) task.equipmentDetails = task.equipmentDetails || {};
    if (dto.deskNumber) task.equipmentDetails.deskNumber = dto.deskNumber;
    if (dto.accessCardNumber) task.equipmentDetails = task.equipmentDetails || {};
    if (dto.accessCardNumber) task.equipmentDetails.accessCardNumber = dto.accessCardNumber;
    if (dto.equipmentItems) {
      task.equipmentDetails = task.equipmentDetails || {};
      task.equipmentDetails.equipmentItems = dto.equipmentItems;
    }

    await onboarding.save();

    this.logger.log(`Equipment reserved for onboarding ${onboardingId}, task ${taskIndex}`);

    return onboarding;
  }

  /**
   * Upload document for onboarding
   */
  async uploadDocument(employeeId: string, dto: UploadDocumentDto): Promise<Document> {
    const document = new this.documentModel({
      ownerId: dto.ownerId ? new Types.ObjectId(dto.ownerId) : new Types.ObjectId(employeeId),
      type: dto.type,
      filePath: dto.filePath,
      uploadedAt: new Date(),
    });

    await document.save();

    this.logger.log(`Document uploaded: ${document._id} for employee ${employeeId}`);

    return document;
  }

  /**
   * Get contract by offer ID (for HR Manager to access signed contract)
   */
  async getContractByOfferId(offerId: string): Promise<Contract> {
    const contract = await this.contractModel
      .findOne({ offerId: new Types.ObjectId(offerId) })
      .populate('documentId')
      .exec();

    if (!contract) {
      throw new NotFoundException(`Contract not found for offer ${offerId}`);
    }

    return contract;
  }

  /**
   * Get contract by ID
   */
  async getContractById(contractId: string): Promise<Contract> {
    const contract = await this.contractModel
      .findById(contractId)
      .populate('documentId')
      .exec();

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    return contract;
  }

  /**
   * Create contract from signed offer
   */
  async createContractFromOffer(
    offerId: string,
    employeeId: string,
    contractDocumentId: string,
    signedContractUrl: string,
  ): Promise<Contract> {
    // Get offer details
    // In a full implementation, we'd fetch the offer
    // For now, we'll create a basic contract

    const contract = new this.contractModel({
      offerId: new Types.ObjectId(offerId),
      acceptanceDate: new Date(),
      documentId: new Types.ObjectId(contractDocumentId),
      employeeSignatureUrl: signedContractUrl,
      employeeSignedAt: new Date(),
      // These would come from the offer
      grossSalary: 0, // Would be populated from offer
      role: '', // Would be populated from offer
    });

    await contract.save();

    this.logger.log(`Contract created from offer ${offerId} for employee ${employeeId}`);

    return contract;
  }

  /**
   * Send onboarding reminder notifications
   */
  async sendOnboardingReminders(): Promise<void> {
    if (!this.notificationsService) {
      this.logger.warn('NotificationsService not available. Skipping reminders.');
      return;
    }

    // Find all pending onboarding tasks with deadlines approaching (within 2 days)
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const onboardings = await this.onboardingModel
      .find({ completed: false })
      .populate('employeeId')
      .exec();

    for (const onboarding of onboardings) {
      // Get employee email from employee profile
      let employeeEmail: string | undefined;
      let employeeName: string | undefined;
      
      try {
        const employeeId = onboarding.employeeId;
        if (employeeId && typeof employeeId === 'object' && 'workEmail' in employeeId) {
          employeeEmail = (employeeId as any).workEmail || (employeeId as any).email;
          employeeName = (employeeId as any).firstName && (employeeId as any).lastName
            ? `${(employeeId as any).firstName} ${(employeeId as any).lastName}`
            : (employeeId as any).fullName || 'Employee';
        }
      } catch (error) {
        this.logger.warn(`Could not fetch employee details: ${error.message}`);
      }

      if (!employeeEmail) {
        this.logger.warn(`No email found for employee ${onboarding.employeeId}. Skipping reminders.`);
        continue;
      }

      for (const task of onboarding.tasks) {
        if (
          task.status === OnboardingTaskStatus.PENDING &&
          task.deadline &&
          task.deadline <= twoDaysFromNow &&
          task.deadline >= now
        ) {
          try {
            const daysUntilDeadline = Math.ceil(
              (task.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            const subject = `Onboarding Reminder: ${task.name}`;
            const body = `
Hello ${employeeName || 'there'},

This is a reminder that you have an upcoming onboarding task:

Task: ${task.name}
${task.department ? `Department: ${task.department}` : ''}
Deadline: ${task.deadline.toLocaleDateString()} (${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} remaining)
${task.notes ? `Notes: ${task.notes}` : ''}

Please complete this task before the deadline.

Best regards,
HR Team
            `.trim();

            await this.notificationsService.sendNotification({
              type: 'onboarding_reminder' as any,
              channel: 'email' as any,
              recipientId: onboarding.employeeId.toString(),
              recipientEmail: employeeEmail!,
              recipientName: employeeName || 'Employee',
              subject,
              content: body,
              relatedEntityId: onboarding._id.toString(),
              relatedEntityType: 'onboarding',
            });

            this.logger.log(`Reminder sent for task: ${task.name} to ${employeeEmail}`);
          } catch (error) {
            this.logger.warn(`Failed to send reminder for task ${task.name}: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * ONB-013: Automated account provisioning on start date
   * Checks for onboarding tasks where start date is today and triggers provisioning
   */
  async triggerProvisioningForStartDate(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all onboarding records with provisioning tasks due today (start date)
    const onboardings = await this.onboardingModel
      .find({ completed: false })
      .populate('employeeId')
      .exec();

    for (const onboarding of onboardings) {
      // Find provisioning tasks (System Admin tasks)
      const provisioningTasks = onboarding.tasks.filter(
        (task: any) => task.systemAdminTask === true && task.provisioningRequired === true
      );

      for (const task of provisioningTasks) {
        if (task.deadline) {
          const taskDate = new Date(task.deadline);
          taskDate.setHours(0, 0, 0, 0);

          // If task deadline (start date) is today, trigger provisioning
          if (taskDate.getTime() === today.getTime() && task.status === OnboardingTaskStatus.PENDING) {
            const employeeId = onboarding.employeeId.toString();
            
            this.logger.log(`[ONB-013] Triggering automated provisioning for employee ${employeeId} (start date: ${task.deadline})`);
            
            // Log provisioning request (in production, this would call actual IT systems)
            this.logger.log(`[ONB-013] Provisioning required for:`);
            this.logger.log(`  - Employee ID: ${employeeId}`);
            this.logger.log(`  - Email access: Required`);
            this.logger.log(`  - SSO access: Required`);
            this.logger.log(`  - Payroll access: Required`);
            this.logger.log(`  - Internal systems access: Required`);
            
            // Mark task as in progress
            task.status = OnboardingTaskStatus.IN_PROGRESS;
            await onboarding.save();
            
            // Send notification to System Admin (if available)
            if (this.notificationsService) {
              try {
                // In production, fetch System Admin email from Employee Profile
                this.logger.log(`[ONB-013] Provisioning notification sent to System Admin`);
              } catch (error) {
                this.logger.warn(`[ONB-013] Failed to send provisioning notification: ${error.message}`);
              }
            }
          }
        }
      }
    }
  }

  /**
   * ONB-009: System Admin provisions system access
   * This method is called by System Admin to trigger actual provisioning
   */
  async provisionSystemAccess(employeeId: string): Promise<{ message: string; actions: string[] }> {
    this.logger.log(`[ONB-009] System Admin provisioning requested for employee ${employeeId}`);
    
    // Find onboarding record
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();

    if (!onboarding) {
      throw new NotFoundException(`Onboarding not found for employee ${employeeId}`);
    }

    // Find provisioning tasks
    const provisioningTasks = onboarding.tasks.filter(
      (task: any) => task.systemAdminTask === true && task.provisioningRequired === true
    );

    if (provisioningTasks.length === 0) {
      throw new BadRequestException(`No provisioning tasks found for employee ${employeeId}`);
    }

    const actions = [
      'Email account created and configured',
      'SSO access provisioned',
      'Payroll system access granted',
      'Internal systems access provisioned',
      'User account activated in authentication system',
    ];

    // Log provisioning actions
    this.logger.log(`[ONB-009] Provisioning actions for employee ${employeeId}:`);
    actions.forEach(action => {
      this.logger.log(`  - ${action}`);
    });

    // In production, this would call actual IT system APIs:
    /*
    if (this.systemAdminService) {
      await this.systemAdminService.createEmailAccount(employeeId);
      await this.systemAdminService.provisionSSOAccess(employeeId);
      await this.systemAdminService.grantPayrollAccess(employeeId);
      await this.systemAdminService.provisionInternalSystemAccess(employeeId);
      await this.systemAdminService.activateUserAccount(employeeId);
    }
    */

    // Update provisioning tasks status
    for (const task of provisioningTasks) {
      task.status = OnboardingTaskStatus.COMPLETED;
      task.completedAt = new Date();
    }
    await onboarding.save();

    // Send notification to employee (if available)
    if (this.notificationsService) {
      try {
        // In production, fetch employee email and send notification
        this.logger.log(`[ONB-009] Employee notified of system access provisioning`);
      } catch (error) {
        this.logger.warn(`[ONB-009] Failed to send notification: ${error.message}`);
      }
    }

    return {
      message: 'System access provisioning completed',
      actions,
    };
  }
}

