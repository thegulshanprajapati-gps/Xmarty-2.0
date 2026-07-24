import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://xmartydb:vccbX9NUew645ETH@xmartydb.gkguxnv.mongodb.net/?appName=XmartyDB';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

let indexesEnsured = false;

export async function getDb(dbName = 'xmarty') {
  const conn = await clientPromise;
  const db = conn.db(dbName);
  
  if (!indexesEnsured) {
    indexesEnsured = true;
    // Asynchronously declare indexes for critical query path optimizations (Phase 11)
    Promise.all([
      db.collection("users").createIndex({ email: 1 }),
      db.collection("exam_attempt_questions").createIndex({ sessionId: 1 }),
      db.collection("exam_activity_logs").createIndex({ examId: 1, studentId: 1 }),
      db.collection("notifications").createIndex({ userId: 1 }),
    ]).catch(err => {
      console.warn("Index creation failed or already exists:", err);
    });
  }

  return db;
}

export async function getClient() {
  return await clientPromise;
}

