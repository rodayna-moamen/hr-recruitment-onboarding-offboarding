# Data Model Design – Recruitment, Onboarding, and Offboarding

This document describes the MongoDB collections used by this subsystem.

The subsystem will share the main **Employee** collection with the rest of the HR system.  
Our module mainly owns:

- `candidates`
- `onboarding_tasks`
- `offboarding_requests`

---

## 1. Candidate Collection

**Collection name:** `candidates`

| Field               | Type      | Description |
|---------------------|-----------|-------------|
| `_id`               | ObjectId  | Candidate ID |
| `fullName`          | String    | Candidate name |
| `email`             | String    | Candidate email |
| `phone`             | String    | Optional phone |
| `appliedPositionId` | ObjectId  | Position candidate applied for |
| `resumeUrl`         | String    | URL to uploaded CV |
| `status`            | String    | applied, screening, interview, offered, accepted, rejected |
| `notes`             | String    | HR comments |
| `createdAt`         | Date      | Application datetime |
| `updatedAt`         | Date      | Last status update |

---

## 2. OnboardingTask Collection

**Collection name:** `onboarding_tasks`

| Field         | Type      | Description |
|--------------|-----------|-------------|
| `_id`        | ObjectId  | Unique task ID |
| `employeeId` | ObjectId  | Employee reference |
| `taskName`   | String    | Name of task |
| `description`| String    | Details |
| `assignedTo` | String    | HR/IT/etc |
| `dueDate`    | Date      | Deadline |
| `status`     | String    | pending, in_progress, completed |
| `createdAt`  | Date      | Task creation |
| `completedAt`| Date      | When task was finished |

---

## 3. OffboardingRequest Collection

**Collection name:** `offboarding_requests`

| Field              | Type       | Description |
|--------------------|------------|-------------|
| `_id`              | ObjectId   | Unique ID |
| `employeeId`       | ObjectId   | Employee leaving |
| `reason`           | String     | Resignation/Termination |
| `initiatedBy`      | String     | HR or Manager |
| `effectiveDate`    | Date       | Last working day |
| `clearanceChecklist` | Array    | List of items to return/clear |
| `payrollSettlementStatus` | String | pending, completed |
| `status`           | String     | open, in_progress, completed |
| `createdAt`        | Date       | Request created |
| `updatedAt`        | Date       | Updated |

---

## 4. Clearance Checklist Item Format

```json
{
  "item": "Return laptop",
  "cleared": false,
  "clearedAt": null
}

