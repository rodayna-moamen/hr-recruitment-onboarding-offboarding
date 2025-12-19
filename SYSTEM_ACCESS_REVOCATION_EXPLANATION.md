# System Access Revocation - How It Works

## Overview

When an employee resigns or is terminated, the system needs to revoke all their access to prevent unauthorized use of company systems.

## How Access Revocation Works

### 1. **Trigger Point**
- Access revocation is triggered when a termination request is **approved** by HR Manager
- The `revokeSystemAccess()` method is called automatically in `OffboardingService.triggerOffboardingNotification()`

### 2. **What Gets Revoked**

The system revokes access to:
- **Authentication System**: User account is disabled
- **SSO (Single Sign-On)**: SSO access is revoked
- **Email System**: Email account is disabled
- **Internal Systems**: Access to all internal applications is revoked
- **Active Sessions/Tokens**: All active JWT tokens are invalidated

### 3. **Token Invalidation**

**How tokens become invalid:**
- When the user account is **disabled** in the authentication system, the JWT validation fails
- The `JwtAuthGuard` checks if the user account is active before allowing access
- Even if the employee has a valid token, they cannot use it once the account is disabled
- The token doesn't need to be "removed" - it becomes invalid because the account is disabled

**Implementation:**
```typescript
// In JwtAuthGuard (authentication layer)
async canActivate(context: ExecutionContext) {
  const token = extractTokenFromRequest(context);
  const payload = verifyToken(token);
  const user = await employeeModel.findById(payload.id);
  
  // Token becomes invalid if account is disabled
  if (user.status === EmployeeStatus.INACTIVE || user.status === EmployeeStatus.TERMINATED) {
    throw new UnauthorizedException('Account is disabled');
  }
  
  return true;
}
```

### 4. **Current Implementation**

**Location**: `backend/src/recruitment/services/offboarding.service.ts` → `revokeSystemAccess()`

**Current Status**: ⚠️ **Logged Only** (requires IT system integration)

**What it does now:**
- Logs the revocation request with timestamp
- Logs all actions that would be taken
- Sends notification to System Admin
- **Does NOT** actually revoke access (requires IT system integration)

**What it will do in production:**
```typescript
// Example production implementation:
await systemAdminService.disableUserAccount(employeeId);
await systemAdminService.revokeSSOAccess(employeeId);
await systemAdminService.revokeEmailAccess(employeeId);
await systemAdminService.revokeInternalSystemAccess(employeeId);
await systemAdminService.invalidateAllTokens(employeeId);
```

### 5. **Integration Points**

To fully implement access revocation, integrate with:
- **Authentication Service**: Disable user account
- **SSO Provider** (e.g., Okta, Azure AD): Revoke SSO access
- **Email System** (e.g., Microsoft 365, Google Workspace): Disable email
- **Internal Applications**: Revoke access via each application's API
- **Session Management**: Invalidate all active sessions

### 6. **Security Considerations**

- **Immediate Revocation**: Access should be revoked immediately upon termination approval
- **Audit Trail**: All revocation actions are logged with timestamps
- **Notification**: System Admin is notified of all revocations
- **Token Expiry**: Even if tokens aren't explicitly invalidated, they expire naturally (typically 24 hours)

### 7. **Testing**

To test access revocation:
1. Create a termination request for an employee
2. Approve the termination
3. Check logs for revocation request
4. Verify employee cannot login (account disabled)
5. Verify employee's token is rejected by JwtAuthGuard

---

## Summary

**Current State**: Access revocation is **logged and tracked**, but actual revocation requires IT system integration.

**Token Invalidation**: Tokens become invalid when the user account is disabled in the authentication system. The JWT validation checks account status, so disabled accounts cannot use tokens even if they have them.

**Production Ready**: The framework is in place. When IT systems are integrated, the actual revocation calls can be added to `revokeSystemAccess()`.

