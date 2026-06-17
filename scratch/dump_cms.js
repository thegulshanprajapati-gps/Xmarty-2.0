const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('xmartycreator');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Dump settings
    const settings = await db.collection('settings').find({}).toArray();
    console.log('Settings:', JSON.stringify(settings, null, 2));

    // Search all collections for any text containing "Impact" or "Journey"
    for (const col of collections) {
      const docs = await db.collection(col.name).find({}).toArray();
      const docsStr = JSON.stringify(docs);
      if (docsStr.toLowerCase().includes('impact') || docsStr.toLowerCase().includes('journey')) {
        console.log(`Match in collection "${col.name}":`);
        // Find matching doc
        docs.forEach(doc => {
          const docStr = JSON.stringify(doc);
          if (docStr.toLowerCase().includes('impact') || docStr.toLowerCase().includes('journey')) {
            console.log(JSON.stringify(doc, null, 2));
          }
        });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
