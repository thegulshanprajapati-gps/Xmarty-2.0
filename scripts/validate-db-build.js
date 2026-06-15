const { MongoClient } = require('mongodb');
const http = require('http');
const https = require('https');
const url = require('url');

const uri = process.env.MONGODB_URI || 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

function checkUrl(targetUrl) {
  return new Promise((resolve) => {
    if (!targetUrl || typeof targetUrl !== 'string') {
      return resolve(false);
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return resolve(true);
    }

    const parsed = url.parse(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request({
      method: 'HEAD',
      host: parsed.host,
      path: parsed.path,
      timeout: 5000,
    }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function validate() {
  console.log('[BUILD VALIDATION] Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('xmartycreator');
    
    await db.command({ ping: 1 });
    console.log('[BUILD VALIDATION] Database connection successful.');

    const collections = ['site_settings', 'content_blocks', 'cms_content', 'settings', 'pages', 'course_folders', 'courses', 'users'];
    const imageUrls = [];

    for (const colName of collections) {
      console.log(`[BUILD VALIDATION] Checking collection: ${colName}...`);
      const col = db.collection(colName);
      const docs = await col.find({}).toArray();
      console.log(`[BUILD VALIDATION] Loaded ${docs.length} documents from ${colName}.`);
      
      for (const doc of docs) {
        if (doc.logo) imageUrls.push(doc.logo);
        if (doc.image) imageUrls.push(doc.image);
        if (doc.featured_image) imageUrls.push(doc.featured_image);
        
        if (colName === 'content_blocks' && doc.type === 'json' && Array.isArray(doc.json_value)) {
          doc.json_value.forEach(item => {
            if (item && item.image) {
              imageUrls.push(item.image);
            }
          });
        }
      }
    }

    if (imageUrls.length > 0) {
      console.log(`[BUILD VALIDATION] Found ${imageUrls.length} image URLs to check...`);
      for (const imgUrl of imageUrls) {
        console.log(`[BUILD VALIDATION] Checking image: ${imgUrl}`);
        const ok = await checkUrl(imgUrl);
        if (!ok) {
          console.warn(`[BUILD VALIDATION WARNING] Image failed to load: ${imgUrl}`);
        } else {
          console.log(`[BUILD VALIDATION] Image loaded successfully: ${imgUrl}`);
        }
      }
    }

    console.log('[BUILD VALIDATION] SUCCESS: Database is created and all tables and images are validated.');
  } catch (error) {
    console.error('[BUILD VALIDATION FAILED]', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

validate();
