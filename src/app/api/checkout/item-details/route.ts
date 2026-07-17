import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const targetId = searchParams.get('targetId');

    if (!type || !targetId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = await getDb();
    let details: any = null;

    if (type === 'Course') {
      const isMongoId = ObjectId.isValid(targetId);
      const query = isMongoId ? { _id: new ObjectId(targetId) } : { slug: targetId };
      const course = await db.collection('course_folders').findOne(query);
      if (course) {
        details = {
          title: course.title,
          description: course.description || 'Gain standard course entry with verified certification pathways.',
          price: course.price || 499,
          thumbnail: course.thumbnail_url || `https://picsum.photos/seed/${course._id}/800/600`,
          category: course.category || 'Education'
        };
      }
    } else if (type === 'Subscription') {
      const [planId] = targetId.split(':');
      const isMongoId = ObjectId.isValid(planId);
      const query = isMongoId ? { _id: new ObjectId(planId) } : { slug: planId };
      const plan = await db.collection('subscription_plans').findOne(query);
      if (plan) {
        details = {
          title: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          thumbnail: '/logo.png', // Fallback brand icon
          category: 'Membership'
        };
      }
    } else if (type === 'Bundle') {
      const isMongoId = ObjectId.isValid(targetId);
      const query = isMongoId ? { _id: new ObjectId(targetId) } : { slug: targetId };
      const bundle = await db.collection('bundles').findOne(query);
      if (bundle) {
        details = {
          title: bundle.name,
          description: bundle.description || 'All-inclusive creative developer stack bundles package.',
          price: bundle.price || 999,
          thumbnail: bundle.thumbnail_url || `https://picsum.photos/seed/${bundle._id}/800/600`,
          category: 'Bundle Pack'
        };
      }
    }

    if (!details) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, details });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
