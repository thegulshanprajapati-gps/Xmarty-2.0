require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('xmarty_dev');
    const pages = await db.collection('pages').find({}).toArray();
    console.log(JSON.stringify(pages, null, 2));
  } finally {
    await client.close();
  }
}
check();
