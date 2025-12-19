# Comprehensive Testing Guide - Recruitment, Onboarding & Offboarding

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Test Data Setup](#test-data-setup)
3. [Recruitment Process Testing](#recruitment-process-testing)
4. [Onboarding Process Testing](#onboarding-process-testing)
5. [Offboarding Process Testing](#offboarding-process-testing)
6. [Integration Testing](#integration-testing)
7. [Business Rules Verification](#business-rules-verification)
8. [Workflow End-to-End Testing](#workflow-end-to-end-testing)

---

## Prerequisites

### 1. Environment Setup
- ✅ Backend running on `http://localhost:4000`
- ✅ Frontend running on `http://localhost:3000`
- ✅ MongoDB Atlas connected and accessible
- ✅ SMTP configured for email notifications (optional for testing)

### 2. User Accounts Required

**Create the following test accounts:**

#### HR Manager
- Employee Number: `HRMAN001`
- Password: `password123`
- Role: `HR Manager`

#### HR Employee
- Employee Number: `HRE001`
- Password: `password123`
- Role: `HR Employee`

#### System Admin
- Employee Number: `SYSADM001`
- Password: `password123`
- Role: `System Admin`

#### Candidate
- Candidate Number: `CAND2025-001`
- Password: `password123`
- Register via: `/register`

### 3. Test Data in MongoDB

**Department (Organization Structure)**
```javascript
db.departments.insertOne({
  departmentId: "DEPT-IT",
  name: "Information Technology",
  description: "IT Department",
  status: "active"
});
```

**Position (Organization Structure)**
```javascript
db.positions.insertOne({
  positionId: "POS-SWE-001",
  title: "Software Engineer",
  departmentId: "DEPT-IT",
  payGrade: "PG-5",
  status: "active"
});
```

---

## Test Data Setup

### Step 1: Create Test Users

1. **Register HR Manager**
   - Navigate to `/register` (if HR registration available)
   - Or insert directly into MongoDB:
   ```javascript
   db.employeeprofiles.insertOne({
     employeeNumber: "HRMAN001",
     password: "$2b$10$...", // bcrypt hash of "password123"
     firstName: "John",
     lastName: "Manager",
     systemRole: "hr_manager",
     status: "active"
   });
   ```

2. **Register Candidate**
   - Navigate to `/register`
   - Fill in:
     - Candidate Number: `CAND2025-001`
     - Password: `password123`
     - First Name: `Jane`
     - Last Name: `Candidate`
     - National ID: `123456789`
     - Resume URL: (optional)
   - Click "Apply Now"
   - ✅ Verify: Success message appears, redirected to login

---

## Recruitment Process Testing

### REC-003: HR Manager - Define Job Templates

**Test Steps:**
1. Login as HR Manager (`HRMAN001`)
2. Navigate to `/subsystems/recruitment`
3. Click "Job Templates"
4. Click "Create Template"
5. Fill in:
   - Title: `Senior Software Engineer`
   - Department: `DEPT-IT` (must exist in Organization Structure)
   - Location: `Remote`
   - Openings: `3`
   - Qualifications: `Bachelor's in CS, 5+ years experience`
   - Skills: `JavaScript, React, Node.js`
6. Click "Save"
7. ✅ **Verify**: Template created successfully
8. ✅ **Verify**: Template appears in templates list
9. ✅ **BR2 Compliance**: All required fields (title, department, location, openings, qualifications) are present

**Negative Test:**
- Try creating template with invalid department
- ✅ **Verify**: Error message appears: "Department not found"

---

### REC-004: HR Manager - Establish Hiring Process Templates

**Test Steps:**
1. Login as HR Manager
2. Navigate to `/subsystems/recruitment/templates`
3. Create a job template (as above)
4. ✅ **Verify**: Application stages are automatically defined:
   - Screening
   - HR Interview
   - Department Interview
   - Offer
   - Hired
5. ✅ **BR9 Compliance**: Stages are tracked automatically

**Verification:**
- Check backend enum: `ApplicationStage` enum should have all stages
- ✅ **Verify**: Progress percentage updates automatically as application moves through stages

---

### REC-023: HR Employee - Preview and Publish Jobs

**Test Steps:**
1. Login as HR Employee (`HRE001`)
2. Navigate to `/subsystems/recruitment/jobs`
3. Click "Create Job Requisition"
4. Fill in:
   - Select Template: (choose template from REC-003)
   - Location: `Remote`
   - Openings: `2`
   - Publish Status: `draft`
5. Click "Create"
6. ✅ **Verify**: Job created with status "draft"
7. Click on the job → Click "Publish"
8. ✅ **Verify**: Status changes to "published"
9. Navigate to `/subsystems/recruitment/careers` (as candidate)
10. ✅ **Verify**: Published job appears in careers page
11. ✅ **BR6 Compliance**: Only published jobs appear on careers page

**Negative Test:**
- Try publishing job with invalid department
- ✅ **Verify**: Error message appears

---

### REC-007: Candidate - Upload CV and Apply

**Test Steps:**
1. Login as Candidate (`CAND2025-001`)
2. Navigate to `/subsystems/recruitment/careers`
3. Click on a published job
4. Scroll to "Apply now" section
5. Fill in:
   - Candidate ID: `CAND2025-001` (or your candidate ID)
   - CV Upload: Select a PDF file (max 5MB)
   - OR CV URL: `https://example.com/resume.pdf`
   - ✅ **Consent Checkbox**: Check "I consent to data processing"
6. Click "Submit Application"
7. ✅ **Verify**: Success message appears
8. ✅ **Verify**: Application created in database
9. ✅ **BR12 Compliance**: CV is required and stored
10. ✅ **BR28 Compliance**: Consent is required

**Negative Tests:**
- Try applying without CV
- ✅ **Verify**: Error: "CV/Resume is required"
- Try applying without consent
- ✅ **Verify**: Error: "Candidate consent is required"

---

### REC-028: Candidate - Consent for Data Processing

**Test Steps:**
1. As Candidate, navigate to `/subsystems/recruitment/consent-management`
2. ✅ **Verify**: Consent history is displayed
3. ✅ **Verify**: Current consent status is shown
4. Click "Withdraw Consent" (if consent was given)
5. ✅ **Verify**: Consent withdrawn successfully
6. ✅ **Verify**: Notification log shows `CONSENT_WITHDRAWN`
7. ✅ **NFR-33 Compliance**: GDPR compliance - consent can be withdrawn

**Verification:**
- Check MongoDB: `notificationlogs` collection should have consent records
- ✅ **Verify**: Consent history endpoint returns all consent actions

---

### REC-030: HR Employee - Tag Candidates as Referrals

**Test Steps:**
1. Login as HR Employee
2. Navigate to `/subsystems/recruitment/referrals`
3. Click "Create Referral"
4. Fill in:
   - Candidate ID: `CAND2025-001`
   - Referred By: (employee ID)
   - Notes: `Referred by internal employee`
5. Click "Submit"
6. ✅ **Verify**: Referral created
7. Navigate to `/subsystems/recruitment/applications`
8. ✅ **Verify**: Referred candidates are marked/tagged
9. ✅ **BR14, BR25 Compliance**: Referrals get priority in screening

---

### REC-008: HR Employee - Track Candidates Through Stages

**Test Steps:**
1. Login as HR Employee
2. Navigate to `/subsystems/recruitment/applications`
3. ✅ **Verify**: All applications are displayed
4. Click on an application to view details
5. ✅ **Verify**: Current stage is displayed (e.g., "Screening")
6. Use status dropdown to update:
   - Select new stage: "HR Interview"
   - Select new status: "in_process"
7. Click "Update Status"
8. ✅ **Verify**: Status updated successfully
9. ✅ **Verify**: Status history shows the change
10. ✅ **BR9 Compliance**: Application tracked through defined stages
11. ✅ **BR11 Compliance**: Email notification sent to candidate (check email/notification logs)

**Filter Testing:**
- Filter by Stage: Select "Screening"
- ✅ **Verify**: Only applications in Screening stage are shown
- Filter by Status: Select "in_process"
- ✅ **Verify**: Only in-process applications are shown

---

### REC-010: HR Employee - Schedule Interview Invitations

**Test Steps:**
1. Login as HR Employee
2. Navigate to `/subsystems/recruitment/interviews`
3. Click "Schedule Interview"
4. Fill in:
   - Application: Select an application
   - Interview Type: `HR Interview`
   - Scheduled Date: (future date, e.g., tomorrow)
   - Scheduled Time: `10:00 AM`
   - Interview Mode: `Virtual`
   - Panel Members: (select employee IDs)
   - Location/Meeting Link: `https://meet.example.com/interview`
5. Click "Schedule"
6. ✅ **Verify**: Interview created successfully
7. ✅ **Verify**: Interview appears in interviews list
8. ✅ **BR19(a) Compliance**: Interview scheduled with time slot, panel, mode
9. ✅ **BR19(c) Compliance**: Calendar event created (check Time Management logs)
10. ✅ **BR19(d) Compliance**: Email notification sent to candidate

**Verification:**
- Check notification logs: Interview invitation email should be logged
- Check Time Management: Calendar event should be created (if integrated)

---

### REC-021: HR Employee - Coordinate Interview Panels

**Test Steps:**
1. Follow REC-010 steps to schedule interview
2. ✅ **Verify**: Panel members are listed in interview details
3. ✅ **Verify**: Panel availability is checked (if Time Management integrated)
4. Navigate to interview details page
5. ✅ **Verify**: All panel members are displayed
6. ✅ **BR19(b) Compliance**: Panel availability checked
7. ✅ **BR20 Compliance**: Panel members have required knowledge/training (assumed)

---

### REC-011: HR Employee - Provide Interview Feedback

**Test Steps:**
1. Login as HR Employee (or panel member)
2. Navigate to `/subsystems/recruitment/interviews`
3. Click on a completed interview (or one with `scheduledDate` in the past)
4. Scroll to "Submit Feedback" section
5. Fill in:
   - Technical Score: `8/10`
   - Communication Score: `7/10`
   - Culture Fit Score: `9/10`
   - Overall Score: `8/10`
   - Comments: `Strong candidate, good technical skills`
   - Recommendation: `Proceed to next stage`
6. Click "Submit Feedback"
7. ✅ **Verify**: Feedback submitted successfully
8. ✅ **Verify**: Feedback appears in interview details
9. ✅ **BR10 Compliance**: Comments and ratings added at each stage
10. ✅ **BR22 Compliance**: Only panel members can submit feedback

**Verification:**
- Check backend: `AssessmentResult` should be saved
- ✅ **Verify**: Multiple panel members can submit feedback for same interview

---

### REC-020: HR Employee - Structured Assessment Forms

**Test Steps:**
1. Login as HR Employee
2. Navigate to `/subsystems/recruitment/interviews/[id]`
3. ✅ **Verify**: Structured scoring form is displayed:
   - Technical Score
   - Communication Score
   - Culture Fit Score
   - Overall Score
4. Submit feedback (as in REC-011)
5. ✅ **Verify**: Scores are validated (0-10 range)
6. ✅ **BR21 Compliance**: Criteria are pre-set
7. ✅ **BR23 Compliance**: Multiple assessment tools supported

**Verification:**
- Check evaluation criteria endpoint: `GET /evaluation-criteria`
- ✅ **Verify**: Criteria are role-specific (from JobTemplate) or default

---

### REC-017: Candidate - Receive Application Status Updates

**Test Steps:**
1. Login as Candidate
2. Navigate to `/subsystems/recruitment/my-applications`
3. ✅ **Verify**: All candidate's applications are displayed
4. ✅ **Verify**: Current status is shown for each application
5. ✅ **Verify**: Status history is visible
6. As HR Employee, update application status (REC-008)
7. Refresh candidate's "My Applications" page
8. ✅ **Verify**: Status updated in real-time
9. ✅ **BR27 Compliance**: Status tracking visualized and up-to-date
10. ✅ **BR36 Compliance**: Email notification sent (check email/notification logs)

**Verification:**
- Check notification logs: Status update email should be logged
- ✅ **Verify**: Email contains new status and stage information

---

### REC-022: HR Employee - Automated Rejection Notifications

**Test Steps:**
1. Login as HR Employee
2. Navigate to `/subsystems/recruitment/applications`
3. Click on an application
4. Click "Reject Application"
5. Customize rejection template:
   - Subject: `Application Update - Thank You`
   - Reason: `Does not meet current requirements`
   - Body: `Thank you for your interest...`
6. Click "Reject & Send Notification"
7. ✅ **Verify**: Application status changes to "rejected"
8. ✅ **Verify**: Rejection email sent (check notification logs)
9. ✅ **BR36 Compliance**: Email template used
10. ✅ **BR37 Compliance**: Communication log stored

**Verification:**
- Check notification logs: Rejection email should be logged
- ✅ **Verify**: Email contains rejection reason and template message

---

### REC-009: HR Manager - Monitor Recruitment Progress

**Test Steps:**
1. Login as HR Manager
2. Navigate to `/subsystems/recruitment/analytics`
3. ✅ **Verify**: Analytics dashboard displays:
   - Total applications
   - Applications by stage
   - Time-to-hire metrics
   - Conversion rates
   - Referral statistics
4. Apply filters:
   - Date range
   - Requisition
   - Status
5. ✅ **Verify**: Metrics update based on filters
6. ✅ **BR33 Compliance**: Multiple reports generated (time-to-hire, source effectiveness)

---

### REC-014: HR Manager - Manage Job Offers and Approvals

**Test Steps:**
1. Login as HR Manager
2. Navigate to `/subsystems/recruitment/offers`
3. Click "Create Offer"
4. Fill in:
   - Application: Select an application in "offer" or "in_process" status
   - Gross Salary: `50000`
   - Signing Bonus: `5000`
   - Benefits: `Health, Dental, Vision`
   - Deadline: (future date)
   - Offer Letter Content: `We are pleased to offer you...`
5. Click "Create Offer"
6. ✅ **Verify**: Offer created successfully
7. Navigate to offer details: `/subsystems/recruitment/offers/[id]`
8. Click "Approve Offer" (HR Manager)
9. ✅ **Verify**: HR approval status changes to "approved"
10. ✅ **BR26(b) Compliance**: Related parties' approval required (HR + Financial)
11. ✅ **Verify**: Financial approval is also required (if Finance module integrated)

**Negative Test:**
- Try creating offer for application not in correct status
- ✅ **Verify**: Error message appears

---

### REC-018: HR Employee/Manager - Generate and Send Offer Letters

**Test Steps:**
1. Follow REC-014 to create offer
2. ✅ **Verify**: Offer letter content is customizable
3. ✅ **Verify**: Offer includes compensation and benefits
4. As Candidate, navigate to offer details
5. ✅ **Verify**: Offer letter is displayed
6. Click "Accept Offer"
7. ✅ **Verify**: Candidate response recorded (`signedAt` timestamp)
8. ✅ **BR26(a, d) Compliance**: Customizable offer letters with compensation/benefits
9. ✅ **BR37 Compliance**: Communication logs stored

**Verification:**
- Check offer in database: `candidateSignedAt` should be set
- ✅ **Verify**: Offer status shows candidate acceptance

---

### REC-029: HR Employee - Trigger Pre-boarding Tasks

**Test Steps:**
1. Follow REC-018 to get candidate to accept offer
2. ✅ **Verify**: Onboarding is automatically triggered when offer is accepted
3. ✅ **Verify**: Onboarding record created in database
4. ✅ **Verify**: Contract created from offer
5. ✅ **Verify**: Employee profile created (if Employee Profile service integrated)
6. ✅ **BR26(c) Compliance**: Onboarding triggered on acceptance

**Verification:**
- Check onboarding collection: New onboarding record should exist
- Check contract collection: Contract should be created
- ✅ **Verify**: Onboarding tasks are created automatically

---

## Onboarding Process Testing

### Candidate Uploads Signed Contract and Forms

**Test Steps:**
1. Login as Candidate (who accepted offer)
2. Navigate to `/subsystems/recruitment/onboarding`
3. ✅ **Verify**: Onboarding tracker is displayed
4. Find task: "Upload Signed Contract"
5. Click "Upload Document"
6. Select file: Signed contract PDF
7. Select document type: `contract`
8. Click "Upload"
9. ✅ **Verify**: Document uploaded successfully
10. ✅ **Verify**: Task status changes to "completed"
11. ✅ **Verify**: Document linked to onboarding task

**Verification:**
- Check documents collection: Document should be stored
- ✅ **Verify**: File is saved in `backend/uploads/onboarding/`

---

### ONB-001: HR Manager - Create Onboarding Checklists

**Test Steps:**
1. Login as HR Manager
2. Navigate to `/subsystems/recruitment` (backend endpoint)
3. Make API call: `POST /onboarding/checklists`
4. Body:
   ```json
   {
     "name": "Standard IT Onboarding",
     "tasks": [
       {
         "name": "Setup Workstation",
         "department": "IT",
         "deadline": "2025-02-01",
         "notes": "IT will setup your workstation"
       },
       {
         "name": "Complete HR Forms",
         "department": "HR",
         "deadline": "2025-02-01",
         "notes": "Fill out all required HR forms"
       }
     ]
   }
   ```
5. ✅ **Verify**: Checklist created successfully
6. ✅ **BR8, BR11 Compliance**: Checklists support department-specific tasks

**Verification:**
- Check onboarding checklists collection: New checklist should exist
- ✅ **Verify**: Checklist can be used when triggering onboarding

---

### ONB-002: HR Manager - Access Signed Contract

**Test Steps:**
1. Login as HR Manager
2. Make API call: `GET /contracts/offer/[offerId]`
3. ✅ **Verify**: Contract details are returned:
   - Gross salary
   - Signing bonus
   - Role
   - Signatures
   - Document ID
4. ✅ **BR17(a, b) Compliance**: Contract details accessible for employee profile creation

**Verification:**
- ✅ **Verify**: Contract is populated with document details if available

---

### ONB-004: New Hire - View Onboarding Tracker

**Test Steps:**
1. Login as New Hire (employee who accepted offer)
2. Navigate to `/subsystems/recruitment/onboarding`
3. ✅ **Verify**: Onboarding tracker displays:
   - All tasks with status (pending, in_progress, completed)
   - Progress bar showing completion percentage
   - Task details: name, department, deadline, notes
4. ✅ **BR11(a, b) Compliance**: Tracker includes onboarding workflow and department-specific tasks

**Verification:**
- ✅ **Verify**: Tasks are organized by department
- ✅ **Verify**: Progress percentage updates as tasks are completed

---

### ONB-005: New Hire - Receive Reminders

**Test Steps:**
1. Create onboarding with tasks due soon (within 2 days)
2. Wait for scheduled cron job (or trigger manually)
3. ✅ **Verify**: Email reminder sent to new hire
4. ✅ **Verify**: Email contains:
   - Task details
   - Deadline
   - Days remaining
5. ✅ **BR12 Compliance**: Reminders sent and delivery tracked

**Verification:**
- Check notification logs: `ONBOARDING_REMINDER` should be logged
- ✅ **Verify**: Reminders sent daily at 9 AM for tasks due within 2 days
- ✅ **Verify**: Urgent reminders sent every 6 hours for tasks due today

---

### ONB-007: New Hire - Upload Documents

**Test Steps:**
1. Login as New Hire
2. Navigate to `/subsystems/recruitment/onboarding`
3. Find task requiring document upload
4. Click "Upload Document"
5. Select file: ID card, certificate, etc.
6. Select document type: `id`, `certificate`, or `contract`
7. Click "Upload"
8. ✅ **Verify**: Document uploaded successfully
9. ✅ **Verify**: Document linked to task
10. ✅ **BR7 Compliance**: Documents collected and can be verified by HR

**Verification:**
- Check documents collection: Document should be stored
- ✅ **Verify**: File types validated (PDF, DOC, DOCX, JPEG, PNG)
- ✅ **Verify**: File size limit enforced (10MB)

---

### ONB-012: HR Employee - Reserve Equipment

**Test Steps:**
1. Login as HR Employee
2. Navigate to onboarding details (backend endpoint)
3. Make API call: `POST /onboarding/[id]/tasks/[taskIndex]/reserve-equipment`
4. Body:
   ```json
   {
     "deskNumber": "D-205",
     "accessCardNumber": "AC-12345",
     "equipment": {
       "laptop": "LAP-001",
       "monitor": "MON-001",
       "keyboard": "KB-001"
     }
   }
   ```
5. ✅ **Verify**: Equipment reserved successfully
6. ✅ **Verify**: Equipment details stored in task
7. ✅ **BR9(c) Compliance**: Equipment reservation tracked

**Verification:**
- Check onboarding task: `equipmentReserved` should be `true`
- ✅ **Verify**: Equipment details are stored in task

---

### ONB-009: System Admin - Provision System Access

**Test Steps:**
1. Login as System Admin
2. Navigate to onboarding details
3. ✅ **Verify**: "Setup Workstation" task exists (IT provisioning task)
4. Make API call: `POST /onboarding/[id]/provision-access`
5. ✅ **Verify**: System access provisioning logged
6. ✅ **BR9(b) Compliance**: IT tasks generated (actual provisioning requires IT system integration)

**Note**: Actual provisioning requires IT system integration. Current implementation creates tasks and logs provisioning requests.

---

### ONB-013: HR Manager - Automated Account Provisioning

**Test Steps:**
1. Create onboarding with start date in the future
2. ✅ **Verify**: Onboarding tasks include IT provisioning tasks
3. Wait for start date (or trigger manually)
4. ✅ **Verify**: Scheduled provisioning triggered
5. ✅ **BR9(b), BR20 Compliance**: Provisioning scheduled, revocation handled in offboarding

**Verification:**
- Check onboarding scheduler: Cron job should trigger provisioning on start date
- ✅ **Verify**: Revocation is handled in offboarding module (OFF-007)

---

### ONB-018: HR Manager - Automatic Payroll Initiation

**Test Steps:**
1. Follow REC-029 to trigger onboarding
2. ✅ **Verify**: Start date is set in employee profile
3. ✅ **Verify**: Payroll initiation is logged
4. ✅ **BR9(a) Compliance**: Payroll initiation triggered automatically

**Verification:**
- Check employee profile: `startDate` should be set
- ✅ **Verify**: Start date used for payroll cycle calculation

---

### ONB-019: HR Manager - Automatic Signing Bonus Processing

**Test Steps:**
1. Create offer with signing bonus (REC-014)
2. Candidate accepts offer (REC-018)
3. Onboarding triggered (REC-029)
4. ✅ **Verify**: Signing bonus automatically processed
5. ✅ **Verify**: `PayrollExecutionService.handleNewHireEvent()` called
6. ✅ **BR9(a) Compliance**: Signing bonus processed automatically

**Verification:**
- Check PayrollExecutionService logs: Signing bonus should be processed
- ✅ **Verify**: Signing bonus amount and payment date are correct

---

## Offboarding Process Testing

### OFF-018, OFF-019: Employee - Resignation Request & Tracking

**Test Steps:**
1. Login as Employee
2. Navigate to `/subsystems/recruitment/resignation`
3. Click "Submit Resignation Request"
4. Fill in:
   - Reason: `Personal reasons, relocating`
   - Resignation Date: (future date)
5. Click "Submit"
6. ✅ **Verify**: Resignation request created
7. ✅ **Verify**: Status is "PENDING"
8. Refresh page
9. ✅ **Verify**: Resignation request appears with status
10. ✅ **BR6 Compliance**: Resignation request workflow implemented

**Verification:**
- Check termination requests collection: Request should exist
- ✅ **Verify**: Status tracking works correctly

---

### OFF-001: HR Manager - Initiate Termination Reviews

**Test Steps:**
1. Login as HR Manager
2. Navigate to `/subsystems/recruitment/terminations`
3. Click "Initiate Termination Review"
4. Fill in:
   - Employee ID: (select employee)
   - Reason: `Performance issues, multiple warnings`
   - Termination Date: (future date)
5. Click "Initiate"
6. ✅ **Verify**: Termination review created
7. ✅ **Verify**: Performance data fetched automatically
8. ✅ **Verify**: Clearance checklist created automatically
9. ✅ **BR4 Compliance**: Termination has effective date and clearly stated reason

**Verification:**
- Check termination requests collection: Request should exist
- ✅ **Verify**: Performance data is fetched from PerformanceModule
- ✅ **Verify**: Low performance scores (< 60) are identified

---

### OFF-006: HR Manager - Offboarding Checklist

**Test Steps:**
1. Follow OFF-001 to initiate termination
2. ✅ **Verify**: Clearance checklist created automatically
3. Navigate to termination details
4. ✅ **Verify**: Checklist includes:
   - IT assets
   - ID cards
   - Equipment items
5. ✅ **BR13(a) Compliance**: Checklist includes IT assets, ID cards, equipment

**Verification:**
- Check clearance checklist collection: Checklist should exist
- ✅ **Verify**: Equipment list is populated from onboarding

---

### OFF-010: HR Manager - Multi-Department Exit Clearance

**Test Steps:**
1. Follow OFF-006 to view clearance checklist
2. ✅ **Verify**: Departments listed:
   - IT
   - Finance
   - Facilities
   - Line Manager
   - HR
3. As IT Manager, update IT clearance:
   - Status: `APPROVED`
   - Comments: `All IT assets returned`
4. ✅ **Verify**: IT clearance status updated
5. Repeat for other departments
6. ✅ **Verify**: All departments must approve before final payroll
7. ✅ **BR13(b, c), BR14 Compliance**: Multi-department clearance required

**Verification:**
- Check clearance checklist: Department statuses should be tracked
- ✅ **Verify**: Final approval requires all departments to approve

---

### OFF-007: System Admin - Revoke System Access

**Test Steps:**
1. Follow OFF-001 to initiate termination
2. As HR Manager, approve termination
3. ✅ **Verify**: System access revocation triggered automatically
4. ✅ **Verify**: Employee status updated to "TERMINATED"
5. ✅ **Verify**: Revocation logged with timestamp
6. ✅ **BR3(c), BR19 Compliance**: Access revoked, employee status updated

**Verification:**
- Check employee profile: Status should be "TERMINATED"
- Check logs: Revocation should be logged
- ✅ **Verify**: Integration with EmployeeProfileService works

---

### OFF-013: HR Manager - Offboarding Notification

**Test Steps:**
1. Follow OFF-001 to initiate termination
2. Approve termination (all clearances complete)
3. ✅ **Verify**: Offboarding notification triggered automatically
4. ✅ **Verify**: Leave balance fetched from LeavesModule
5. ✅ **Verify**: `PayrollExecutionService.handleResignationEvent()` or `handleTerminationEvent()` called
6. ✅ **Verify**: Benefits termination processed
7. ✅ **BR9, BR11 Compliance**: Leave balance reviewed, benefits terminated

**Verification:**
- Check PayrollExecutionService logs: Benefits termination should be processed
- ✅ **Verify**: Final pay calculation includes unused leave (encashed)

---

## Integration Testing

### 1. Recruitment → Onboarding Integration

**Test Steps:**
1. Complete full recruitment process (REC-003 through REC-029)
2. Candidate accepts offer
3. ✅ **Verify**: Onboarding automatically triggered
4. ✅ **Verify**: Contract created from offer
5. ✅ **Verify**: Employee profile created
6. ✅ **Verify**: Onboarding tasks created

---

### 2. Onboarding → Payroll Integration

**Test Steps:**
1. Complete onboarding process
2. ✅ **Verify**: Payroll initiation triggered
3. ✅ **Verify**: Signing bonus processed
4. ✅ **Verify**: Start date set in employee profile

---

### 3. Onboarding → Offboarding Integration

**Test Steps:**
1. Complete onboarding (equipment reserved)
2. Initiate termination (OFF-001)
3. ✅ **Verify**: Equipment from onboarding appears in offboarding checklist
4. ✅ **Verify**: System access revocation works (ONB-013 → OFF-007)

---

### 4. Performance → Offboarding Integration

**Test Steps:**
1. Create employee with low performance scores
2. Initiate termination review (OFF-001)
3. ✅ **Verify**: Performance data fetched automatically
4. ✅ **Verify**: Low scores identified (< 60 or poor ratings)

---

### 5. Leaves → Offboarding Integration

**Test Steps:**
1. Create employee with leave balance
2. Initiate termination and approve
3. ✅ **Verify**: Leave balance fetched from LeavesModule
4. ✅ **Verify**: Unused leave included in final pay calculation

---

## Business Rules Verification

### BR2: Job Requisition Requirements
- ✅ **Test**: Create job template without required fields
- ✅ **Verify**: Validation error appears
- ✅ **Status**: COMPLIANT

### BR6: Automatic Posting
- ✅ **Test**: Publish job requisition
- ✅ **Verify**: Job appears on careers page automatically
- ✅ **Status**: COMPLIANT

### BR9: Stage Tracking
- ✅ **Test**: Update application status
- ✅ **Verify**: Application tracked through defined stages
- ✅ **Status**: COMPLIANT

### BR12: CV Upload Required
- ✅ **Test**: Apply without CV
- ✅ **Verify**: Error: "CV/Resume is required"
- ✅ **Status**: COMPLIANT

### BR19: Interview Scheduling
- ✅ **Test**: Schedule interview
- ✅ **Verify**: Time slots, panel, modes selected; calendar invites sent
- ✅ **Status**: COMPLIANT

### BR26: Offer Management
- ✅ **Test**: Create and approve offer
- ✅ **Verify**: Related parties' approval required; onboarding triggered on acceptance
- ✅ **Status**: COMPLIANT

### BR28: Consent Required
- ✅ **Test**: Apply without consent
- ✅ **Verify**: Error: "Candidate consent is required"
- ✅ **Status**: COMPLIANT

### BR36: Automated Notifications
- ✅ **Test**: Update application status
- ✅ **Verify**: Email notification sent and logged
- ✅ **Status**: COMPLIANT

---

## Workflow End-to-End Testing

### Complete Recruitment → Onboarding → Offboarding Flow

**Test Steps:**

#### Phase 1: Recruitment
1. **HR Manager** creates job template (REC-003)
2. **HR Employee** publishes job (REC-023)
3. **Candidate** applies with CV and consent (REC-007, REC-028)
4. **HR Employee** tracks application, schedules interview (REC-008, REC-010)
5. **HR Employee** submits interview feedback (REC-011)
6. **HR Manager** creates and approves offer (REC-014)
7. **Candidate** accepts offer (REC-018)
8. ✅ **Verify**: Onboarding triggered automatically (REC-029)

#### Phase 2: Onboarding
9. **Candidate** uploads signed contract (Candidate Upload)
10. **New Hire** views onboarding tracker (ONB-004)
11. **New Hire** uploads documents (ONB-007)
12. **HR Employee** reserves equipment (ONB-012)
13. **System Admin** provisions system access (ONB-009)
14. ✅ **Verify**: Payroll initiated, signing bonus processed (ONB-018, ONB-019)

#### Phase 3: Offboarding
15. **Employee** submits resignation (OFF-018)
16. **HR Manager** initiates termination review (OFF-001)
17. **HR Manager** manages clearance checklist (OFF-006)
18. **Departments** provide clearance sign-offs (OFF-010)
19. **System Admin** revokes system access (OFF-007)
20. **HR Manager** triggers final settlement (OFF-013)
21. ✅ **Verify**: Complete workflow executed successfully

---

## Test Checklist Summary

### Recruitment (17 Requirements)
- [ ] REC-003: Job Templates
- [ ] REC-004: Hiring Process Templates
- [ ] REC-023: Preview and Publish Jobs
- [ ] REC-007: Upload CV and Apply
- [ ] REC-028: Consent for Data Processing
- [ ] REC-030: Tag Referrals
- [ ] REC-008: Track Candidates
- [ ] REC-010: Schedule Interviews
- [ ] REC-021: Coordinate Panels
- [ ] REC-011: Interview Feedback
- [ ] REC-020: Structured Assessment
- [ ] REC-017: Status Updates
- [ ] REC-022: Rejection Notifications
- [ ] REC-009: Monitor Progress
- [ ] REC-014: Manage Offers
- [ ] REC-018: Generate Offer Letters
- [ ] REC-029: Trigger Pre-boarding

### Onboarding (11 Requirements)
- [ ] Candidate Uploads Signed Contract
- [ ] ONB-001: Create Checklists
- [ ] ONB-002: Access Contract
- [ ] ONB-004: View Tracker
- [ ] ONB-005: Receive Reminders
- [ ] ONB-007: Upload Documents
- [ ] ONB-012: Reserve Equipment
- [ ] ONB-009: Provision System Access
- [ ] ONB-013: Automated Provisioning
- [ ] ONB-018: Payroll Initiation
- [ ] ONB-019: Signing Bonus Processing

### Offboarding (6 Requirements)
- [ ] OFF-018, OFF-019: Resignation Request & Tracking
- [ ] OFF-001: Initiate Termination Reviews
- [ ] OFF-006: Offboarding Checklist
- [ ] OFF-010: Multi-Department Clearance
- [ ] OFF-007: Revoke System Access
- [ ] OFF-013: Offboarding Notification

---

## Troubleshooting

### Common Issues

1. **"Employee ID not found"**
   - Solution: Ensure user is logged in and `employeeId` is in localStorage
   - Check: `localStorage.getItem('employeeId')` or `localStorage.getItem('userId')`

2. **"Department not found"**
   - Solution: Create department in Organization Structure first
   - Check: Department exists in `departments` collection

3. **"CV/Resume is required"**
   - Solution: Upload CV file or provide CV URL
   - Check: File size < 5MB, valid format (PDF, DOC, DOCX)

4. **"Candidate consent is required"**
   - Solution: Check consent checkbox when applying
   - Check: Consent logged in notification logs

5. **Interview status shows "completed" for future date**
   - Solution: Backend auto-updates status based on `scheduledDate`
   - Check: `scheduledDate` is in the past

6. **403 Forbidden errors**
   - Solution: Check user role matches endpoint requirements
   - Check: JWT token is valid and includes correct role

---

## Test Data Cleanup

After testing, clean up test data:

```javascript
// MongoDB cleanup
db.applications.deleteMany({ candidateId: ObjectId("...") });
db.offers.deleteMany({ candidateId: ObjectId("...") });
db.onboardings.deleteMany({ employeeId: ObjectId("...") });
db.terminationrequests.deleteMany({ employeeId: ObjectId("...") });
```

---

**End of Comprehensive Testing Guide**

