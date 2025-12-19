# Recruitment Schemas Usage Verification

## All Schemas in `backend/src/recruitment/models/`

### ✅ All 13 Schemas Are Used

| Schema | Used In | Status |
|--------|---------|--------|
| **JobTemplate** | `recruitment.service.ts` (createJobTemplate, updateJobTemplate, etc.) | ✅ Used |
| **JobRequisition** | `recruitment.service.ts` (createJobRequisition, findAllJobRequisitions, etc.) | ✅ Used |
| **Application** | `recruitment.service.ts` (createApplication, findAllApplications, etc.) | ✅ Used |
| **ApplicationStatusHistory** | `recruitment.service.ts` (getApplicationHistory, updateApplicationStatus) | ✅ Used |
| **Interview** | `recruitment.service.ts` (scheduleInterview, findAllInterviews, etc.) | ✅ Used |
| **AssessmentResult** | `recruitment.service.ts` (submitInterviewFeedback) | ✅ Used |
| **Referral** | `recruitment.service.ts` (createReferral, findAllReferrals, etc.) | ✅ Used |
| **Offer** | `recruitment.service.ts` (createOffer, findAllOffers, approveOffer, etc.) | ✅ Used |
| **Contract** | `onboarding.service.ts`, `offboarding.service.ts`, `recruitment.service.ts` | ✅ Used |
| **Document** | `onboarding.service.ts` (uploadDocument) | ✅ Used |
| **TerminationRequest** | `offboarding.service.ts` (createResignationRequest, approveTermination, etc.) | ✅ Used |
| **ClearanceChecklist** | `offboarding.service.ts` (getClearanceChecklist, updateClearanceItem, etc.) | ✅ Used |
| **Onboarding** | `onboarding.service.ts` (triggerOnboarding, getOnboardingByEmployeeId, etc.) | ✅ Used |

### Schema Details

1. **JobTemplate** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `createJobTemplate()`, `updateJobTemplate()`, `findAllJobTemplates()`, `deleteJobTemplate()`
   - Also used in: `getEvaluationCriteria()` to derive role-specific criteria

2. **JobRequisition** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `createJobRequisition()`, `findAllJobRequisitions()`, `findJobRequisitionById()`, `publishJob()`

3. **Application** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `createApplication()`, `findAllApplications()`, `findApplicationById()`, `updateApplicationStatus()`

4. **ApplicationStatusHistory** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `getApplicationHistory()`, `updateApplicationStatus()` (creates history entries)

5. **Interview** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `scheduleInterview()`, `findAllInterviews()`, `findInterviewsByApplication()`, `findInterviewById()`, `submitInterviewFeedback()`

6. **AssessmentResult** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `submitInterviewFeedback()` (creates assessment results)

7. **Referral** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `createReferral()`, `findAllReferrals()`, `findReferralsByCandidate()`

8. **Offer** ✅
   - Used in: `recruitment.service.ts`
   - Methods: `createOffer()`, `findAllOffers()`, `findOfferById()`, `approveOffer()`, `respondToOffer()`, `triggerOnboarding()`

9. **Contract** ✅
   - Used in: `onboarding.service.ts`, `offboarding.service.ts`, `recruitment.service.ts`
   - Methods: 
     - `onboarding.service.ts`: `getContractByOfferId()`, `getContractById()`, `createContractFromOffer()`, `triggerOnboarding()`
     - `offboarding.service.ts`: `createResignationRequest()` (requires contractId)
     - `recruitment.service.ts`: `triggerOnboarding()` (creates contract)

10. **Document** ✅
    - Used in: `onboarding.service.ts`
    - Methods: `uploadDocument()` (creates Document records)
    - Also referenced in: `Onboarding` schema tasks (documentId field)

11. **TerminationRequest** ✅
    - Used in: `offboarding.service.ts`
    - Methods: `createResignationRequest()`, `initiateTerminationReview()`, `getAllTerminationRequests()`, `getTerminationRequestById()`, `approveTermination()`

12. **ClearanceChecklist** ✅
    - Used in: `offboarding.service.ts`
    - Methods: `getClearanceChecklist()`, `updateClearanceItem()`, `updateEquipmentReturn()`, `markCardReturned()`

13. **Onboarding** ✅
    - Used in: `onboarding.service.ts`
    - Methods: `triggerOnboarding()`, `getOnboardingByEmployeeId()`, `getOnboardingById()`, `updateOnboardingTask()`, `reserveEquipment()`, `sendOnboardingReminders()`, `triggerProvisioningForStartDate()`, `provisionSystemAccess()`

### Additional Schema (Not in models folder)

- **Candidate** ✅
  - Location: `backend/src/employee-profile/models/candidate.schema.ts`
  - Used in: `recruitment.service.ts` (populated in applications, referrals, offers)
  - Also used in: `onboarding.service.ts` (for candidate details)

---

## Conclusion

**All 13 schemas in `backend/src/recruitment/models/` are actively used** in the recruitment subsystem. No unused schemas.

**Schema Registration**: All schemas are properly registered in `RecruitmentModule` (lines 42-56).

**Integration**: All schemas are integrated with their respective services and controllers.

