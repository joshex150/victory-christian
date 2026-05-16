// One-off seed script. Run with:
//   MONGODB_URI="..." node scripts/seed.mjs
//
// Idempotent: it will only set fields that don't already exist on the site doc,
// so re-running this won't overwrite anything you've edited in /admin.

import { MongoClient } from "mongodb";

const DEFAULT_CONTENT = {
  eyebrow: "New eBook",
  headline: "You learned the hard way. Not anymore.",
  subheadline: "A book for women who are done shrinking.",
  body: `No one hands you a manual for being a woman. Instead, you figure it out through almost-relationships, quiet resentment, people you outgrow, and versions of yourself you have to unlearn.

This book puts words to the things you felt but couldn't explain — the patterns you stayed in too long and the moments you knew better but hoped anyway.

It's not a guide to being a woman, but the clarity you wish you had earlier. Because you don't become her by trying harder, you become her by breaking the pattern.`,
  bookTitle: "No Guide to Womanhood",
  author: "by the author",
  formHeading: "Be first to get it when it drops.",
  formMicrocopy: "No spam, just early access.",
  buttonText: "Sign up today",
  privacyNote: "We respect your privacy. Unsubscribe at any time.",
  footerText: "Built for readers who are ready to break the pattern.",
  coverImage: "",
  releaseDate: "",
};

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI env var is required.");
  process.exit(1);
}

const explicitDb = process.env.MONGODB_DB;

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15_000 });

try {
  await client.connect();
  const db = explicitDb ? client.db(explicitDb) : client.db();
  console.log(`Connected to database: ${db.databaseName}`);

  // Use $setOnInsert so existing edits in /admin are NEVER overwritten.
  const result = await db
    .collection("meta")
    .updateOne(
      { _id: "site" },
      { $setOnInsert: { _id: "site", ...DEFAULT_CONTENT } },
      { upsert: true },
    );

  if (result.upsertedCount > 0) {
    console.log("✓ Inserted default site content into meta._id=site");
  } else {
    console.log("• Site content doc already exists — leaving it untouched.");
  }

  await db
    .collection("subscribers")
    .createIndex({ email: 1 }, { unique: true })
    .then(() => console.log("✓ Ensured unique index on subscribers.email"))
    .catch((e) => console.warn("Index creation warning:", e.message));

  const counts = {
    meta: await db.collection("meta").countDocuments(),
    subscribers: await db.collection("subscribers").countDocuments(),
    assets: await db.collection("assets").countDocuments(),
  };
  console.log("Collection counts:", counts);
} catch (err) {
  console.error("Seed failed:", err);
  process.exitCode = 1;
} finally {
  await client.close();
}
