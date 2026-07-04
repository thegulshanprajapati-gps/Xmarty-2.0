const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function run() {
  const uri = "mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to DB successfully");
    const db = client.db('xmartycreator');
    
    // 1. Delete all existing records for admin@xmartycreator.com
    const deleteRes = await db.collection('users').deleteMany({ email: 'admin@xmartycreator.com' });
    console.log(`Deleted ${deleteRes.deletedCount} existing admin@xmartycreator.com records.`);

    // 2. Hash password "admin123"
    const passwordHash = await bcrypt.hash('admin123', 10);

    // 3. Insert the clean, single Super Admin user
    const insertRes = await db.collection('users').insertOne({
      email: 'admin@xmartycreator.com',
      password_hash: passwordHash,
      full_name: 'Super Admin',
      role: 'super-admin',
      enrolled_courses: [],
      two_factor_enabled: false,
      totp_secret: null,
      backup_codes: [],
      created_at: new Date()
    });
    
    console.log(`Successfully created Super Admin user with ID: ${insertRes.insertedId}`);

    // Verify
    const verifyUser = await db.collection('users').findOne({ email: 'admin@xmartycreator.com' });
    console.log("Verified User in DB:", JSON.stringify(verifyUser, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
