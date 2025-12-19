# Seed Data Explanation

## What Does the Seed Output Mean?

When you run `npm run seed:recruitment`, the script:

1. **Connects to MongoDB** - Uses your existing database connection
2. **Clears existing data** - Deletes all recruitment-related data from these collections:
   - `jobtemplates`
   - `jobrequisitions`
   - `applications`
   - `interviews`
   - `offers`
   - `onboardings`
   - `documents`
   - `contracts`
   - `applicationstatushistories`
   - `assessmentresults`
   - `referrals`
   - `terminationrequests`
   - `clearancechecklists`

3. **Creates new test data** - Inserts comprehensive test data for all subsystems

## Will I See This Data on the Website?

**✅ YES!** Once the seed script completes successfully, you will see:

### When You Login as HR Manager (`HRMAN1008`):
- **Job Templates**: 10 templates (Engineering, HR, Marketing, etc.)
- **Job Requisitions**: 15 requisitions (published, draft, closed)
- **Applications Dashboard**: 20 applications in various stages
- **Interviews**: 8 scheduled interviews
- **Offers**: 2 offers (1 accepted, 1 pending)
- **Analytics**: Recruitment metrics based on the seed data
- **Onboarding Tracking**: 4 onboarding records
- **Termination Requests**: 3 termination requests

### When You Login as HR Employee/Admin (`HRADM1008`):
- Same as HR Manager (can access all recruitment features)
- Can publish jobs, schedule interviews, manage applications

### When You Login as Candidate (`CAND6789`):
- **Browse Jobs**: 10 published job openings
- **My Applications**: Applications linked to this candidate (if any exist)
- **My Interviews**: Scheduled interviews for this candidate
- **My Offers**: Offers sent to this candidate
- **Onboarding Tasks**: Onboarding tasks if offer was accepted

### When You Login as Employee (`EMP234`):
- **Onboarding Tracker**: Onboarding tasks if this employee has an onboarding record
- **Resignation Request**: Can submit resignation requests
- **My Offboarding Tasks**: Offboarding tasks if termination is in progress

### When You Login as System Admin (`SYS112`):
- **Provision System Access**: List of onboarding records needing provisioning
- **Revoke System Access**: List of approved terminations needing access revocation
- **NO access** to recruitment, job templates, or job requisitions

## Important Notes

### 1. User Accounts vs Seed Data
- **Seed data** creates job templates, applications, offers, etc.
- **User accounts** (HRMAN1008, CAND6789, etc.) are **separate** from seed data
- The seed data uses **placeholder ObjectIds** for users (not your actual user accounts)
- To link seed data to your accounts, you would need to:
  - Find your user's ObjectId from the database
  - Update the seed data to use those ObjectIds
  - OR create applications/offers via the website using your logged-in account

### 2. Linking Seed Data to Your Account

**Option A: Use the Website (Recommended)**
- Login as `CAND6789`
- Browse jobs and apply (this creates applications linked to your account)
- The seed data provides jobs to apply for

**Option B: Update Seed Data (Advanced)**
- Find your user ObjectId:
  ```javascript
  db.employeeprofiles.findOne({ employeeNumber: "HRMAN1008" })._id
  db.candidates.findOne({ candidateNumber: "CAND6789" })._id
  ```
- Update seed file to use these ObjectIds instead of `new Types.ObjectId()`

### 3. What You'll See Immediately

After seeding, you can immediately see:
- ✅ **Job Templates** (HR Manager/Admin)
- ✅ **Published Job Requisitions** (All users on careers page)
- ✅ **Applications** (HR users in dashboard)
- ✅ **Interviews** (HR users and candidates)
- ✅ **Offers** (HR users and candidates)
- ✅ **Onboarding Records** (HR users, employees, candidates)
- ✅ **Termination Requests** (HR users, employees)
- ✅ **Clearance Checklists** (HR users)

### 4. What Requires Your Account

To see data **linked to your specific account**:
- **My Applications** (Candidate) - Only shows if you apply via website
- **My Interviews** (Candidate) - Only shows interviews for your applications
- **My Offers** (Candidate) - Only shows offers for your applications
- **My Onboarding Tasks** (Employee/Candidate) - Only shows if you have an onboarding record

## Testing Workflow

### Recommended Testing Flow:

1. **Login as HR Manager** (`HRMAN1008`)
   - View job templates, requisitions, applications
   - Create new job requisitions
   - Manage offers and approvals

2. **Login as Candidate** (`CAND6789`)
   - Browse published jobs (from seed data)
   - Apply for a job (creates application linked to your account)
   - View your applications

3. **Login as HR Employee** (`HRADM1008`)
   - Track the candidate's application
   - Schedule interviews
   - Create offers

4. **Login as Candidate** (`CAND6789`)
   - Accept the offer
   - This triggers onboarding automatically

5. **Login as Employee** (`EMP234`)
   - View onboarding tasks
   - Upload documents

6. **Login as System Admin** (`SYS112`)
   - Provision system access for new hires

## Summary

✅ **Seed data is in the database** - You'll see it when you open the website
✅ **Use provided credentials** - HRMAN1008, HRADM1008, CAND6789, EMP234, SYS112
⚠️ **Link your account** - To see "My Applications/Interviews/Offers", apply via the website or update seed data with your user ObjectIds

The seed data provides a rich testing environment with jobs, applications, interviews, and offers ready to test the complete workflow!

