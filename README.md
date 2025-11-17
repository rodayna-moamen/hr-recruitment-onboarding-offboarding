# HR Recruitment, Onboarding, and Offboarding Subsystem

This repository contains the **Recruitment, Onboarding, and Offboarding** subsystem of the HR Management System project.

The subsystem manages the full employee lifecycle:

- From candidate application and selection (Recruitment)
- To preparing the new hire for their first working day (Onboarding)
- To handling resignation or termination in a structured way (Offboarding)

All data is integrated with the global HR system and shared employee database.

---

## 1. Scope of This Subsystem

### 1.1 Recruitment

- Accept job applications from candidates
- Track candidate status (applied → screening → interview → offer → accepted/rejected)
- Store candidate information and notes
- When a candidate is hired, create an employee entry in the shared Employee collection
- Notify other modules that a new employee will join (Organization Structure, Payroll, Employee Profile)

### 1.2 Onboarding

- Create onboarding tasks for a new hire (e.g., contracts, accounts, equipment, payroll forms)
- Assign onboarding tasks to HR or responsible staff
- Track the completion status of onboarding tasks
- Mark onboarding as complete and trigger:
  - Payroll initialization (basic salary, start date)
  - Organizational assignment (department, position)

### 1.3 Offboarding

- Initiate offboarding when an employee resigns or is terminated
- Generate a clearance checklist (return equipment, disable accounts, handover, etc.)
- Track completion of clearance items
- Coordinate with:
  - Payroll for final settlement
  - Organization Structure to free the position
  - Employee Profile to deactivate the employee

---

## 2. Technology Stack (Planned)

This subsystem is planned to use:

- **Frontend:** Next.js (TypeScript)
- **Backend:** NestJS (TypeScript)
- **Database:** MongoDB
- **Authentication:** JWT-based authentication (shared with main system)
- **HTTP Client:** Axios for calling other subsystems' APIs
- **Deployment:** Vercel (frontend) and Heroku/Render (backend) – to be finalized later

For Milestone 1, only the **design and planning** are required (no full implementation yet).

---

## 3. Repository Structure (Planned)

/hr-recruitment-onboarding-offboarding
│
├─ backend
│   ├─ src
│   │   ├─ app.js                   # Main Express app with CRUD endpoints
│   │   └─ utils
│   │       ├─ dummyData.js         # Dummy data helper
│   │       └─ testDummyData.js     # Test dummy data helper
│   │
│   ├─ server.js                    # Server entry point
│   ├─ config/                      # Empty folder for future configuration
│   ├─ controllers/                 # Empty folder for future controllers
│   ├─ middleware/                  # Empty folder for future middleware
│   ├─ models/                      # Empty folder for future Mongoose models
│   └─ routes/                      # Empty folder for future route files
│
├─ frontend                         # Empty for now (Next.js later)
│   └─ src
│
├─ docs                             # Empty for now
│
├─ .env                             # Environment variables (Mongo URI, etc.)
├─ node_modules/                    # Installed dependencies
├─ package.json
├─ package-lock.json
├─ README.md
├─ DATA_MODEL.md
├─ API_DESIGN.md
└─ SYSTEM_FLOW.md

## 4. API Endpoints (Available)

All endpoints are prefixed with /api and return JSON data from MongoDB collections.

Recruitment Jobs
Method	Endpoint	Description
GET	/api/recruitment-jobs	Get all recruitment jobs
GET	/api/recruitment-jobs/:id	Get a single job by jobId
Onboarding Tasks
Method	Endpoint	Description
GET	/api/onboarding-tasks	Get all onboarding tasks
GET	/api/onboarding-tasks/:id	Get a single onboarding task by onboardingId
Offboarding Tasks
Method	Endpoint	Description
GET	/api/offboarding-tasks	Get all offboarding tasks
GET	/api/offboarding-tasks/:id	Get a single offboarding task by offboardingId
