const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('xmartycreator');
    const collections = await db.listCollections().toArray();
    console.log('Searching all collections for font references...');
    
    for (let col of collections) {
      const docs = await db.collection(col.name).find().toArray();
      for (let doc of docs) {
        const str = JSON.stringify(doc).toLowerCase();
        if (str.includes('.ttf') || str.includes('.woff') || str.includes('.otf') || str.includes('font-family') || str.includes('customfont') || str.includes('custom_font')) {
          console.log(`Match in collection "${col.name}":`);
          console.log(JSON.stringify(doc, null, 2));
          console.log('-------------------------------------------');
        }
      }
    }
    console.log('Search finished.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
