const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('xmartycreator');
    const collections = await db.listCollections().toArray();
    console.log('Collections:');
    for (let col of collections) {
      console.log(' - ' + col.name);
      // Let's count documents
      const count = await db.collection(col.name).countDocuments();
      console.log('   Count:', count);
      if (col.name.includes('font') || col.name.includes('setting') || col.name.includes('asset')) {
        const docs = await db.collection(col.name).find().limit(5).toArray();
        console.log('   Sample:', JSON.stringify(docs, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
