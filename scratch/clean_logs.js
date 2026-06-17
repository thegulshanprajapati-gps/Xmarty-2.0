const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

async function cleanLogs() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('xmartycreator');
    
    // Clear ALL security tracking logs since the user confirmed there are no real visits yet.
    // This resets the dashboard stats to exactly zero visits.
    const result = await db.collection('security_logs').deleteMany({});
    console.log(`Deleted ${result.deletedCount} security logs.`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

cleanLogs();
