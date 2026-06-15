const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

async function listFolders() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('xmartycreator');
    const folders = await db.collection('course_folders').find({}).toArray();
    console.log("Current Folders in DB:");
    folders.forEach(f => {
      console.log(`ID: ${f._id} | Title: ${f.title} | Parent: ${f.parent_folder_id} | CourseID: ${f.course_id} | Visibility: ${f.visibility}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

listFolders();
