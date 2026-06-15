require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('xmarty_dev');
    const blocks = await db.collection('content_blocks').find({ page_slug: 'home' }).toArray();
    console.log(JSON.stringify(blocks, null, 2));
  } finally {
    await client.close();
  }
}
check();
