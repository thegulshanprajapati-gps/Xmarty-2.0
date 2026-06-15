import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin' && session.role !== 'admin' && session.role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'ALL';
    const severity = searchParams.get('severity') || 'ALL';
    const domain = searchParams.get('domain') || 'ALL';

    const db = await getDb();
    const filter: any = {};

    if (search) {
      filter.$or = [
        { actor_name: { $regex: search, $options: 'i' } },
        { actor_role: { $regex: search, $options: 'i' } },
        { action_type: { $regex: search, $options: 'i' } },
        { target_entity: { $regex: search, $options: 'i' } },
        { target_id: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'ALL') {
      filter.actor_role = role;
    }

    if (severity !== 'ALL') {
      filter.severity = severity;
    }

    if (domain !== 'ALL') {
      filter.domain = domain;
    }

    const logs = await db.collection('audit_logs')
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      logs: logs.map((l: any) => ({
        ...l,
        id: l._id.toString(),
        _id: undefined
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action_type, target_entity, target_id, before_data, after_data, severity } = body;

    await writeAuditLog(
      req,
      { id: session.id, name: session.full_name || session.email, role: session.role },
      action_type,
      { entity: target_entity || 'unknown', id: target_id || 'unknown' },
      { before: before_data, after: after_data },
      severity || 'INFO'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
