# MongoDB Insert Statements - Copy & Paste Exactly

**⚠️ Replace ObjectIds with your actual IDs before running!**

---

## Applications (2 more examples)

```javascript
db.applications.insertOne({
  "candidateId": ObjectId("507f1f77bcf86cd799439012"),
  "requisitionId": ObjectId("692cc5daa340f0dcf8befbde"),
  "currentStage": "screening",
  "status": "submitted",
  "createdAt": new Date("2025-11-30T23:40:11.035Z"),
  "updatedAt": new Date("2025-11-30T23:40:11.035Z")
});
```

```javascript
db.applications.insertOne({
  "candidateId": ObjectId("507f1f77bcf86cd799439012"),
  "requisitionId": ObjectId("692cc5daa340f0dcf8befbde"),
  "currentStage": "hr_interview",
  "status": "in_process",
  "createdAt": new Date("2025-11-29T10:15:00.000Z"),
  "updatedAt": new Date("2025-12-01T08:30:00.000Z")
});
```

---

## Application Status Histories (2 more examples)

```javascript
db.applicationstatushistories.insertOne({
  "applicationId": ObjectId("692cd5dba340f0dcf8befbf2"),
  "oldStage": "screening",
  "newStage": "department_interview",
  "oldStatus": "in_process",
  "newStatus": "in_process",
  "changedBy": ObjectId("000000000000000000000000"),
  "createdAt": new Date("2025-12-01T09:00:00.000Z"),
  "updatedAt": new Date("2025-12-01T09:00:00.000Z")
});
```

```javascript
db.applicationstatushistories.insertOne({
  "applicationId": ObjectId("692cd5dba340f0dcf8befbf2"),
  "oldStage": "department_interview",
  "newStage": "offer",
  "oldStatus": "in_process",
  "newStatus": "offer",
  "changedBy": ObjectId("000000000000000000000000"),
  "createdAt": new Date("2025-12-01T10:30:00.000Z"),
  "updatedAt": new Date("2025-12-01T10:30:00.000Z")
});
```

---

## Assessment Results

```javascript
db.assessmentresults.insertOne({
  "interviewId": ObjectId("692cde5c3f7ee528322a05d7"),
  "interviewerId": ObjectId("507f1f77bcf86cd799439013"),
  "score": 9.0,
  "comments": "Excellent candidate, highly recommended for the role",
  "createdAt": new Date("2025-12-01T00:25:49.332Z"),
  "updatedAt": new Date("2025-12-01T00:25:49.332Z")
});
```

---

## Interviews

```javascript
db.interviews.insertOne({
  "applicationId": ObjectId("692cd5dba340f0dcf8befbf2"),
  "stage": "hr_interview",
  "scheduledDate": new Date("2024-12-10T14:00:00.000Z"),
  "method": "onsite",
  "panel": [
    ObjectId("507f1f77bcf86cd799439013"),
    ObjectId("507f1f77bcf86cd799439014")
  ],
  "calendarEventId": "CAL-HR-001",
  "status": "scheduled",
  "createdAt": new Date("2025-12-01T01:00:00.000Z"),
  "updatedAt": new Date("2025-12-01T01:00:00.000Z")
});
```

---

## Job Requisitions

```javascript
db.jobrequisitions.insertOne({
  "requisitionId": "REQ-2024-002",
  "templateId": ObjectId("692cc585a340f0dcf8befbdb"),
  "openings": 2,
  "location": "Remote",
  "hiringManagerId": "507f1f77bcf86cd799439011",
  "publishStatus": "draft",
  "postingDate": new Date("2025-12-01T00:00:00.000Z"),
  "expiryDate": new Date("2025-12-31T23:59:59.999Z"),
  "createdAt": new Date("2025-12-01T00:00:00.000Z"),
  "updatedAt": new Date("2025-12-01T00:00:00.000Z")
});
```

---

## Offers

```javascript
db.offers.insertOne({
  "applicationId": ObjectId("692cd5dba340f0dcf8befbf2"),
  "candidateId": ObjectId("507f1f77bcf86cd799439012"),
  "hrEmployeeId": ObjectId("507f1f77bcf86cd799439014"),
  "grossSalary": 95000,
  "signingBonus": 8000,
  "benefits": [
    "Health Insurance",
    "Dental",
    "Vision",
    "401k",
    "Stock Options"
  ],
  "conditions": "Standard employment terms. 60-day probation period.",
  "insurances": "Full health, dental, and vision coverage with family options",
  "content": "We are pleased to offer you the position of Software Engineer at our company. We believe your skills and experience will be a great addition to our team.",
  "role": "Software Engineer",
  "deadline": new Date("2024-12-20T00:00:00.000Z"),
  "applicantResponse": "pending",
  "approvers": [],
  "finalStatus": "pending",
  "createdAt": new Date("2025-12-01T01:00:00.000Z"),
  "updatedAt": new Date("2025-12-01T01:00:00.000Z")
});
```

---

## Referrals

```javascript
db.referrals.insertOne({
  "referringEmployeeId": ObjectId("507f1f77bcf86cd799439016"),
  "candidateId": ObjectId("507f1f77bcf86cd799439012"),
  "role": "Software Engineer",
  "level": "Mid",
  "createdAt": new Date("2025-12-01T00:28:30.386Z"),
  "updatedAt": new Date("2025-12-01T00:28:30.386Z")
});
```

---

## Onboarding (Example - normally created automatically)

```javascript
db.onboardings.insertOne({
  "employeeId": ObjectId("507f1f77bcf86cd799439017"),
  "contractId": ObjectId("507f1f77bcf86cd799439018"),
  "tasks": [
    {
      "name": "Complete Employee Profile",
      "department": "Engineering",
      "status": "pending",
      "deadline": new Date("2025-12-08T00:00:00.000Z"),
      "notes": "Fill in all required employee information"
    },
    {
      "name": "Submit Required Documents",
      "department": "Engineering",
      "status": "pending",
      "deadline": new Date("2025-12-08T00:00:00.000Z"),
      "notes": "Submit ID, certificates, and other required documents"
    },
    {
      "name": "Complete Orientation",
      "department": "Engineering",
      "status": "pending",
      "deadline": new Date("2025-12-15T00:00:00.000Z"),
      "notes": "Attend company orientation session"
    },
    {
      "name": "Setup Workstation",
      "department": "Engineering",
      "status": "pending",
      "deadline": new Date("2025-12-04T00:00:00.000Z"),
      "notes": "IT will setup your workstation and accounts"
    }
  ],
  "completed": false,
  "createdAt": new Date("2025-12-01T01:00:00.000Z"),
  "updatedAt": new Date("2025-12-01T01:00:00.000Z")
});
```

---

## How to Get Your IDs

Before inserting, get your actual IDs:

```javascript
// Get candidate ID
db.candidates.findOne({}, {_id: 1, candidateNumber: 1});

// Get requisition ID  
db.jobrequisitions.findOne({}, {_id: 1, requisitionId: 1});

// Get employee ID
db.employees.findOne({}, {_id: 1, employeeNumber: 1});

// Get application ID
db.applications.findOne({}, {_id: 1});
```

Then replace the ObjectIds in the insert statements above with your actual IDs.

