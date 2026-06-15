import { NextResponse } from 'next/server';

// Editor role permission matrix (backend-enforced only)
const editorAllowedCollections = new Set([
  'support_tickets',
  'content_blocks',
  'moderation_logs',
  'analytics_lite'
]);

const editorAllowedActions = new Set(['find', 'findOne', 'insertOne']);

export function enforceRbac(session: any, action: string, collectionName: string) {
  // If no session, deny
  if (!session || !session.role) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.role;

  if (
    role === 'super-admin' ||
    role === 'super_admin' ||
    role === 'admin' ||
    role === 'instructor'
  ) {
    return true;
  }

  if (role === 'editor') {
    // Editors have a strict matrix
    if (!editorAllowedCollections.has(collectionName)) {
      throw NextResponse.json({ error: 'Forbidden: editor cannot access this collection' }, { status: 403 });
    }

    if (!editorAllowedActions.has(action)) {
      throw NextResponse.json({ error: 'Forbidden: editor cannot perform this action' }, { status: 403 });
    }

    return true;
  }

  // Default: regular users cannot perform mutation actions
  const mutationActions = new Set(['insertOne', 'updateOne', 'deleteOne', 'deleteMany', 'upsert']);
  if (mutationActions.has(action)) {
    throw NextResponse.json({ error: 'Forbidden: insufficient privileges' }, { status: 403 });
  }

  return true;
}

export function enforceDomainRoleRules(session: any, originHost: string) {
  // Example: supportdomain on port 4000 is admin/support only
  if (!originHost) return;
  if (originHost.includes(':4000')) {
    const allowed = new Set(['super-admin', 'admin', 'support']);
    if (!session || !allowed.has(session.role)) {
      throw NextResponse.json({ error: 'Forbidden: domain restricted' }, { status: 403 });
    }
  }
}

export default {};
