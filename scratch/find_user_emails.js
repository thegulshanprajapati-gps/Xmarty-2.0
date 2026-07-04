const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to DB successfully");
    const db = client.db('xmartycreator');
    
    // Find all users and print emails
    const users = await db.collection('users').find({}).toArray();
    console.log("=== USERS COLLECTION EMAILS ===");
    users.forEach(u => {
      console.log(`- Email: ${u.email || u.email_address || 'No email field'}, Role: ${u.role || 'no-role'}, Name: ${u.name || u.username || 'no-name'}`);
    });
    
    // Check if there are other collections that might contain email settings
    const collections = await db.listCollections().toArray();
    console.log("\n=== ALL COLLECTIONS ===");
    console.log(collections.map(c => c.name).join(', '));
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
