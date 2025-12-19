import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Handle both old format (roles array) and new format (role string)
    let userRole = user?.role;
    if (!userRole && user?.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Fallback: use first role from roles array (for backward compatibility)
      userRole = user.roles[0];
      this.logger.warn(`Using deprecated 'roles' array format. Found: ${JSON.stringify(user.roles)}, using: ${userRole}`);
    }

    if (!user || !userRole) {
      this.logger.warn(`Access denied: No user or role found. User: ${JSON.stringify(user)}`);
      throw new ForbiddenException('Access denied: Invalid user or missing role');
    }

    // Normalize roles for comparison
    // SystemRole enum values: 'HR Manager', 'HR Employee', 'HR Admin', etc.
    // Controller decorators use: 'hr_manager', 'hr_employee', 'hr_admin', etc.
    const normalizeRole = (role: string): string => {
      if (!role) return '';
      return role
        .toLowerCase()
        .replace(/\s+/g, '_')  // Replace spaces with underscores
        .replace(/-/g, '_')    // Replace hyphens with underscores
        .trim();
    };

    // Create role mapping for common variations
    const roleMap: Record<string, string[]> = {
      'hr_manager': ['hr_manager', 'hr manager', 'hrmanager', 'hr_m', 'hr_mgr'],
      'hr_employee': ['hr_employee', 'hr employee', 'hremployee', 'hr_e', 'hr_emp'],
      'hr_admin': ['hr_admin', 'hr admin', 'hradmin', 'hr_a', 'hr_admin'],
      'system_admin': ['system_admin', 'system admin', 'systemadmin', 'sys_admin'],
    };

    const userRoleNormalized = normalizeRole(userRole);
    const normalizedRequiredRoles = requiredRoles.map(role => normalizeRole(role));

    // Log for debugging (only log if access is denied to reduce noise)
    // Uncomment the line below if you need to debug role matching issues
    // this.logger.debug(`Role check - User role: "${userRole}" (normalized: "${userRoleNormalized}"), Required: ${JSON.stringify(requiredRoles)} (normalized: ${JSON.stringify(normalizedRequiredRoles)})`);

    // Check if normalized roles match directly
    let hasAccess = normalizedRequiredRoles.includes(userRoleNormalized) || requiredRoles.includes(userRole);
    
    // If no direct match, check role mapping
    if (!hasAccess) {
      for (const requiredRole of normalizedRequiredRoles) {
        const mappedRoles = roleMap[requiredRole] || [];
        if (mappedRoles.some(mapped => normalizeRole(mapped) === userRoleNormalized)) {
          hasAccess = true;
          break;
        }
      }
    }
    
    if (!hasAccess) {
      this.logger.warn(`Access denied: User role "${userRole}" (normalized: "${userRoleNormalized}") does not match required roles: ${JSON.stringify(requiredRoles)}`);
      throw new ForbiddenException(`Access denied: Required roles: ${requiredRoles.join(', ')}, Your role: ${userRole}`);
    }

    return true;
  }
}
