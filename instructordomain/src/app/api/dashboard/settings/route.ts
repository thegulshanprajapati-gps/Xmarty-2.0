import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    let settings: any = await db.collection('site_settings').findOne({}, { sort: { updated_at: -1 } });
    if (!settings) {
      settings = {
        site_name: 'XmartyCreator',
        primary_color: '#FF0000',
        secondary_color: '#FF0000',
        theme_settings: { themeMode: 'light' }
      };
    }
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        id: settings?._id?.toString(),
        _id: undefined
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "Unauthorized: Settings can only be modified from the Support Console." },
    { status: 403 }
  );
}
