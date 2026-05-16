import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "noguide";

if (!uri) {
  // Defer throwing until something actually tries to use Mongo so `next build`
  // can still collect page data when the env var isn't set at build time.
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local or your hosting env.");
  }
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      // Sensible defaults for serverless cold starts
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

let indexesEnsured = false;

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  const db = client.db(dbName);
  if (!indexesEnsured) {
    indexesEnsured = true;
    await Promise.all([
      db.collection("subscribers").createIndex({ email: 1 }, { unique: true }),
      db.collection("subscribers").createIndex({ createdAt: -1 }),
    ]).catch((err) => {
      indexesEnsured = false;
      console.warn("[mongo] index creation failed:", err);
    });
  }
  return db;
}
