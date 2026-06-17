const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

async function inspectSettings() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('xmartycreator');
    const settings = await db.collection('site_settings').find({}).toArray();
    console.log("Current Settings in DB:", JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

inspectSettings();
