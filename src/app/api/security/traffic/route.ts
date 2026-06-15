import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    // 1. Fetch all blogs to map slug/ID to actual titles
    const blogs = await db.collection('blogs').find({}).toArray();
    const blogMap = new Map<string, string>();
    blogs.forEach((b: any) => {
      const id = b._id?.toString() || b.id;
      if (b.slug) blogMap.set(b.slug, b.title);
      if (id) blogMap.set(id, b.title);
    });

    // 2. Fetch all courses to map slug/ID to actual titles
    const courses = await db.collection('course_folders').find({ parent_folder_id: null }).toArray();
    const courseMap = new Map<string, string>();
    courses.forEach((c: any) => {
      const id = c._id?.toString() || c.id;
      if (c.slug) courseMap.set(c.slug, c.title);
      if (id) courseMap.set(id, c.title);
    });

    // 3. Fetch security logs representing views/traffic
    const logs = await db.collection('security_logs').find({}).toArray();

    // 4. Summarize view metrics dynamically
    const trafficMap = new Map<string, { type: 'blog' | 'course'; name: string; route: string; views: number; uniqueVisitors: Set<string>; lastActive: Date }>();

    logs.forEach((log: any) => {
      const route = log.route || '/';
      let type: 'blog' | 'course' | null = null;
      let name = '';

      // Match blog route structures
      if (route.startsWith('/blog/')) {
        const key = route.replace('/blog/', '').trim();
        type = 'blog';
        name = blogMap.get(key) || `Blog: ${key}`;
      } 
      // Match course route structures
      else if (route.startsWith('/courses/')) {
        const key = route.replace('/courses/', '').trim();
        type = 'course';
        name = courseMap.get(key) || `Course: ${key}`;
      }

      if (type) {
        const existing = trafficMap.get(route);
        if (existing) {
          existing.views += 1;
          if (log.ip) existing.uniqueVisitors.add(log.ip);
          if (new Date(log.timestamp) > existing.lastActive) {
            existing.lastActive = new Date(log.timestamp);
          }
        } else {
          const visitorSet = new Set<string>();
          if (log.ip) visitorSet.add(log.ip);
          trafficMap.set(route, {
            type,
            name,
            route,
            views: 1,
            uniqueVisitors: visitorSet,
            lastActive: new Date(log.timestamp)
          });
        }
      }
    });

    const trafficList = Array.from(trafficMap.values()).map(t => ({
      type: t.type,
      name: t.name,
      route: t.route,
      views: t.views,
      visitors: t.uniqueVisitors.size,
      lastActive: t.lastActive
    })).sort((a, b) => b.views - a.views);

    return NextResponse.json({ success: true, traffic: trafficList });
  } catch (error: any) {
    console.error('Failed to resolve traffic metrics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
