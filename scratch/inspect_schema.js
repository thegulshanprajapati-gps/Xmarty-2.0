const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('xmartycreator');
    
    const sampleContent = await db.collection('course_contents').findOne({});
    console.log("=== COURSE CONTENT SAMPLE ===");
    console.log(JSON.stringify(sampleContent, null, 2));
    
    const sampleTest = await db.collection('tests').findOne({});
    console.log("\n=== TEST SAMPLE ===");
    console.log(JSON.stringify(sampleTest, null, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
