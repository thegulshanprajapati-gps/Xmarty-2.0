import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id') || 'default';
    const parentFolderId = searchParams.get('parent_folder_id');

    const db = await getDb();
    const query: any = courseId === 'default'
      ? { course_id: { $in: ['default', 'curriculum-catalog'] } }
      : { course_id: courseId };
    
    if (parentFolderId) {
      query.parent_folder_id = parentFolderId;
    } else {
      query.$or = [{ parent_folder_id: null }, { parent_folder_id: { $exists: false } }];
      query.visibility = 'Public';
      query.approved = { $ne: false };
    }

    const folders = await db.collection('course_folders')
      .find(query)
      .sort({ sort_order: 1 })
      .toArray();

    const formattedFolders = await Promise.all(folders.map(async (f) => {
      const idStr = f._id.toString();
      let thumbnail_url = f.thumbnail_url || null;

      // Dynamic thumbnail lookup if root folder
      if (!f.parent_folder_id && !thumbnail_url) {
        // Find subfolder named "thumbnail" or ".thumbnail"
        const thumbSubfolder = await db.collection('course_folders').findOne({
          parent_folder_id: idStr,
          title: { $regex: /^\.?thumbnail$/i }
        });

        if (thumbSubfolder) {
          const thumbSubIdStr = thumbSubfolder._id.toString();
          // Find first image/file in this thumbnail folder
          const content = await db.collection('course_contents').findOne({
            folder_id: thumbSubIdStr,
            $or: [
              { item_type: 'image' },
              { thumbnail_url: { $ne: null } },
              { file_url: { $regex: /\.(jpg|jpeg|png|webp|gif|bmp)$/i } }
            ]
          });

          if (content) {
            thumbnail_url = content.file_url || content.thumbnail_url;
          }
        }
      }

      return {
        ...f,
        id: idStr,
        _id: undefined,
        thumbnail_url
      };
    }));

    return NextResponse.json(formattedFolders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
