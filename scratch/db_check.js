const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to DB");
    const db = client.db('xmartycreator');
    
    // 1. Check/Delete course folder 6a252703de1df59b5c8d77c9
    const idToDelete = "6a252703de1df59b5c8d77c9";
    const deleteResult = await db.collection('course_folders').deleteOne({ _id: new ObjectId(idToDelete) });
    console.log("Deleted course_folders count:", deleteResult.deletedCount);
    
    // Also delete any contents/subfolders associated with it
    const deleteSubfolders = await db.collection('course_folders').deleteMany({ parent_folder_id: idToDelete });
    console.log("Deleted subfolders count:", deleteSubfolders.deletedCount);
    const deleteContents = await db.collection('course_contents').deleteMany({ folder_id: idToDelete });
    console.log("Deleted contents count:", deleteContents.deletedCount);

    // 2. Let's inspect some documents in course_folders and course_contents
    const sampleFolders = await db.collection('course_folders').find({}).limit(5).toArray();
    console.log("Sample folders:", JSON.stringify(sampleFolders, null, 2));

    const sampleContents = await db.collection('course_contents').find({}).limit(5).toArray();
    console.log("Sample contents:", JSON.stringify(sampleContents, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
