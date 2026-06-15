import { getDb } from './mongodb';
import { NextRequest } from 'next/server';

export interface AuditLogEntry {
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action_type: string;
  target_entity: string;
  target_id: string;
  before_data: any;
  after_data: any;
  timestamp: Date;
  ip_address: string;
  browser_info: string;
  domain: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export async function writeAuditLog(
  req: NextRequest | Request | null,
  actor: { id: string; name: string; role: string },
  actionType: string,
  target: { entity: string; id: string },
  data: { before?: any; after?: any },
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'INFO'
) {
  try {
    const db = await getDb();
    const collection = db.collection('audit_logs');

    let ip_address = '127.0.0.1';
    let browser_info = 'Unknown';
    let domain = 'maindomain';

    if (req) {
      ip_address = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
      browser_info = req.headers.get('user-agent') || 'Unknown';
      const host = req.headers.get('host') || '';
      if (host.includes(':4000') || host.includes('support')) {
        domain = 'supportdomain';
      } else if (host.includes(':5000') || host.includes('instructor')) {
        domain = 'instructordomain';
      }
    }

    const log: AuditLogEntry = {
      actor_id: actor.id,
      actor_name: actor.name,
      actor_role: actor.role,
      action_type: actionType,
      target_entity: target.entity,
      target_id: target.id,
      before_data: data.before || null,
      after_data: data.after || null,
      timestamp: new Date(),
      ip_address,
      browser_info,
      domain,
      severity
    };

    await collection.insertOne(log);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

export async function logSecurityEvent(event: {
  category: string;
  ip: string;
  userAgent: string;
  email?: string;
  status: string;
  details?: any;
}) {
  try {
    const db = await getDb();
    const collection = db.collection('audit_logs');
    const log = {
      actor_id: event.email || 'system',
      actor_name: event.email || 'System / Security Event',
      actor_role: 'system',
      action_type: event.category,
      target_entity: 'security_event',
      target_id: event.status,
      before_data: null,
      after_data: event.details || null,
      timestamp: new Date(),
      ip_address: event.ip,
      browser_info: event.userAgent,
      domain: 'maindomain',
      severity: (event.status === 'ALERT' || event.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING') as any
    };
    await collection.insertOne(log);
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}


