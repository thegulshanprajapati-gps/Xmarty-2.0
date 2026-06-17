const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
console.log("Starting connection test...");
client.connect()
  .then(async () => {
    console.log("Connected successfully!");
    const db = client.db('xmartycreator');
    const settings = await db.collection('site_settings').find({}).toArray();
    console.log("Settings count:", settings.length);
    console.log("Settings data:", JSON.stringify(settings, null, 2));
    await client.close();
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
