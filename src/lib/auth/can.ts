import { SessionUser } from '@/types/auth';

export type Permission =
  | 'course:create'
  | 'course:update'
  | 'course:delete'
  | 'course:view'
  | 'test:create'
  | 'test:update'
  | 'test:delete'
  | 'test:view'
  | 'test:assign'
  | 'student:view'
  | 'student:assign'
  | 'student:grade'
  | 'student:enrollment'
  | 'analytics:view'
  | 'audit:view'
  | 'notification:send'
  | 'support:manage'
  | 'support:view'
  | 'system:settings'
  | 'admin:full_access'
  // Backward compatibility legacy values
  | 'take_test'
  | 'view_result'
  | 'view_profile'
  | 'manage_enrollment'
  | 'audit_log_view';

const permissionsByRole: Record<string, Permission[]> = {
  student: [
    'take_test',
    'view_result',
    'view_profile',
    'course:view',
    'test:view'
  ],
  instructor: [
    'course:create',
    'course:update',
    'course:delete',
    'course:view',
    'test:create',
    'test:update',
    'test:delete',
    'test:view',
    'test:assign',
    'student:view',
    'student:assign',
    'student:grade',
    'student:enrollment',
    'analytics:view',
    'notification:send',
    'view_profile'
  ],
  support: [
    'student:view',
    'student:enrollment',
    'support:manage',
    'support:view',
    'audit:view',
    'view_profile',
    'manage_enrollment',
    'audit_log_view'
  ],
  admin: ['admin:full_access']
};

export function can(user: SessionUser | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  const role = user.role;
  if (!role) return false;

  // Admin and Super Admin get full access bypass
  if (role === 'admin' || role === 'super_admin' || role === 'super-admin') {
    return true;
  }

  const allowedPermissions = permissionsByRole[role] || [];
  return allowedPermissions.includes(permission);
}

