const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully");
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases:", dbs.databases.map(d => d.name));
    
    for (const dbInfo of dbs.databases) {
      const dbInstance = client.db(dbInfo.name);
      const collections = await dbInstance.listCollections().toArray();
      const names = collections.map(c => c.name);
      if (names.includes('course_folders')) {
        console.log(`Found course_folders in database: ${dbInfo.name}`);
        const folders = await dbInstance.collection('course_folders').find({}).toArray();
        console.log("All course_folders:");
        folders.forEach(f => {
          console.log(`- ID: ${f._id || f.id}, Title: "${f.title || f.name}", course_id: "${f.course_id}", parent_folder_id: "${f.parent_folder_id}", metadata: ${JSON.stringify(f.metadata)}`);
        });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
