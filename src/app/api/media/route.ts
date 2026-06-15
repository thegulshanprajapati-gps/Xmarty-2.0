import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function parseSort(sortBy: string | null): any {
  switch (sortBy) {
    case 'oldest':
      return { uploaded_at: 1 };
    case 'name':
      return { name: 1 };
    case 'size':
      return { size: 1 };
    case 'type':
      return { media_type: 1 };
    default:
      return { uploaded_at: -1 };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search')?.trim();
    const sortBy = searchParams.get('sortBy');
    const view = searchParams.get('view');
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.min(72, Math.max(12, Number(searchParams.get('pageSize') || '36')));
    const type = searchParams.get('type');
    const recycle = searchParams.get('recycle') === 'true';

    const db = await getDb();
    const collection = db.collection('media_assets');

    const query: any = {};
    if (recycle) {
      query.deleted = true;
    } else {
      query.deleted = { $ne: true };
    }
    if (folderId) {
      query.folder_id = folderId;
    }
    if (type) {
      query.media_type = type;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { folder_name: { $regex: search, $options: 'i' } },
        { mime_type: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = parseSort(sortBy);
    const total = await collection.countDocuments(query);
    const items = await collection
      .find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      items: items.map(item => ({
        ...item,
        id: item._id.toString(),
        _id: undefined,
      })),
      total,
      page,
      pageSize,
      view: view || 'grid',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = request.headers;
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = headersList.get('user-agent') || '';

    // Enforce rate limiting on upload action
    const { checkRateLimit } = await import('@/lib/rate-limiter');
    const limiterResult = await checkRateLimit({
      key: ip,
      action: 'media_upload',
      limit: 10, // Max 10 uploads per minute
      windowMs: 60 * 1000
    });
    if (!limiterResult.allowed) {
      const { logSecurityEvent } = await import('@/lib/audit');
      await logSecurityEvent({
        category: 'RATE_LIMIT_EXCEEDED',
        ip,
        userAgent,
        status: 'WARN',
        details: { action: 'media_upload' }
      });
      return NextResponse.json({ error: 'Too many uploads. Please slow down.' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File upload is required.' }, { status: 400 });
    }

    const folderId = formData.get('folderId')?.toString() || null;
    const folderName = formData.get('folderName')?.toString() || null;

    // Deep MIME magic-byte verification (Inspect first 12 bytes of file)
    const arrayBuffer = await file.arrayBuffer();
    const fileHeaderBytes = new Uint8Array(arrayBuffer.slice(0, 12));
    const headerHex = Array.from(fileHeaderBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Magic patterns definition
    const signatures = {
      PNG: '89504E470D0A1A0A',
      JPG: 'FFD8FF',
      WEBP_RIFF: '52494646', // RIFF
      WEBP_HEADER: '57454250', // WEBP
      PDF: '25504446' // %PDF
    };

    let detectedType = 'application/octet-stream';
    if (headerHex.startsWith(signatures.PNG)) {
      detectedType = 'image/png';
    } else if (headerHex.startsWith(signatures.JPG)) {
      detectedType = 'image/jpeg';
    } else if (headerHex.startsWith(signatures.WEBP_RIFF) && headerHex.slice(16, 24) === signatures.WEBP_HEADER) {
      detectedType = 'image/webp';
    } else if (headerHex.startsWith(signatures.PDF)) {
      detectedType = 'application/pdf';
    }

    // Verify if claimed mime type matches actual signature structure
    const claimedType = file.type;
    const isImageClaimed = claimedType.startsWith('image/');
    const isImageDetected = detectedType.startsWith('image/');
    
    if ((isImageClaimed && !isImageDetected) || (!isImageClaimed && claimedType === 'application/pdf' && detectedType !== 'application/pdf')) {
      const { logSecurityEvent } = await import('@/lib/audit');
      await logSecurityEvent({
        category: 'MIME_SPOOF',
        ip,
        userAgent,
        status: 'ALERT',
        details: { claimedType, detectedType, fileName: file.name }
      });
      return NextResponse.json({ error: 'Security violation: spoofed file headers detected.' }, { status: 400 });
    }

    // Enforce 3MB limit for thumbnail folder
    const isThumbnailFolder = folderName?.toLowerCase() === '.thumbnail' || folderName?.toLowerCase() === 'thumbnail';
    if (isThumbnailFolder) {
      if (file.size > 3 * 1024 * 1024) {
        return NextResponse.json({ error: 'Thumbnail file size must not exceed 3MB.' }, { status: 400 });
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(claimedType)) {
        return NextResponse.json({ error: 'Thumbnail must be a valid image (JPEG, PNG, WEBP, or GIF).' }, { status: 400 });
      }
    }

    const tagsRaw = formData.get('tags')?.toString() || '';
    const tags = tagsRaw ? tagsRaw.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    const name = formData.get('name')?.toString() || file.name;
    const mimeType = file.type || 'application/octet-stream';
    const mediaType = mimeType.startsWith('video') ? 'video' : 'image';
    const size = file.size;
    const uploadedAt = new Date();

    const db = await getDb();
    const collection = db.collection('media_assets');

    // If uploading to .thumbnail, enforce "only ONE image upload" requirement:
    // Delete previous records in DB and disk for this folder.
    if (isThumbnailFolder && folderId) {
      const existingAssets = await collection.find({ folder_id: folderId }).toArray();
      const fs = await import('fs');
      const path = await import('path');
      for (const asset of existingAssets) {
        if (asset.url && asset.url.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', asset.url);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch {}
        }
      }
      await collection.deleteMany({ folder_id: folderId });
    }

    let url = '';
    let thumbnailUrl = '';

    if (CLOUDINARY_CLOUD_NAME && (CLOUDINARY_UPLOAD_PRESET || (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET))) {
      const cloudForm = new FormData();
      cloudForm.append('file', file);
      if (CLOUDINARY_UPLOAD_PRESET) {
        cloudForm.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      }
      if (CLOUDINARY_API_KEY) {
        cloudForm.append('api_key', CLOUDINARY_API_KEY);
      }
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
      const response = await fetch(cloudinaryUrl, { method: 'POST', body: cloudForm });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }
      url = data.secure_url || data.url;
      thumbnailUrl = data.secure_url || data.url;
    } else {
      const fs = await import('fs');
      const path = await import('path');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const targetPath = path.join(uploadsDir, safeName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(targetPath, buffer);
      url = `/uploads/${safeName}`;
      thumbnailUrl = url;
    }
    const item = {
      name,
      mime_type: mimeType,
      media_type: mediaType,
      size,
      url,
      thumbnail_url: thumbnailUrl,
      tags,
      folder_id: folderId,
      folder_name: folderName,
      deleted: false,
      favorite: false,
      created_at: uploadedAt,
      updated_at: uploadedAt,
      metadata: {
        width: null,
        height: null,
      },
    };

    const result = await collection.insertOne(item);
    return NextResponse.json({
      ...item,
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
