import { Binary, type ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export type SiteContent = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  body: string;
  bookTitle: string;
  author: string;
  formHeading: string;
  formMicrocopy: string;
  buttonText: string;
  privacyNote: string;
  footerText: string;
  coverImage: string; // public path like /api/cover?v=<ts> or external URL
  releaseDate: string;
};

export const DEFAULT_CONTENT: SiteContent = {
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

export type Subscriber = {
  email: string;
  createdAt: string;
  ip?: string | null;
  ua?: string | null;
};

type ContentDoc = SiteContent & { _id: "site" };
type SubscriberDoc = Subscriber & { _id?: ObjectId };
type CoverDoc = {
  _id: "cover";
  data: Binary;
  contentType: string;
  updatedAt: Date;
};

/* -------- content -------- */

export async function getContent(): Promise<SiteContent> {
  const db = await getDb();
  const doc = await db.collection<ContentDoc>("meta").findOne({ _id: "site" });
  if (!doc) return { ...DEFAULT_CONTENT };
  const { _id, ...rest } = doc;
  void _id;
  return { ...DEFAULT_CONTENT, ...rest };
}

export async function saveContent(patch: Partial<SiteContent>): Promise<SiteContent> {
  const db = await getDb();
  const current = await getContent();
  const next: SiteContent = { ...current, ...patch };
  await db
    .collection<ContentDoc>("meta")
    .updateOne({ _id: "site" }, { $set: { ...next, _id: "site" } }, { upsert: true });
  return next;
}

/* -------- subscribers -------- */

export async function getSubscribers(): Promise<Subscriber[]> {
  const db = await getDb();
  const docs = await db
    .collection<SubscriberDoc>("subscribers")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs as Subscriber[];
}

export async function addSubscriber(
  entry: Subscriber,
): Promise<{ added: boolean; total: number }> {
  const db = await getDb();
  const col = db.collection<SubscriberDoc>("subscribers");
  const email = entry.email.toLowerCase();
  try {
    await col.insertOne({ ...entry, email });
    const total = await col.countDocuments();
    return { added: true, total };
  } catch (err) {
    const e = err as { code?: number };
    if (e?.code === 11000) {
      const total = await col.countDocuments();
      return { added: false, total };
    }
    throw err;
  }
}

export async function removeSubscriber(email: string): Promise<number> {
  const db = await getDb();
  const col = db.collection<SubscriberDoc>("subscribers");
  await col.deleteOne({ email: email.toLowerCase() });
  return col.countDocuments();
}

/* -------- cover image (stored as binary in Mongo) -------- */

export async function saveCover(buf: Buffer, contentType: string): Promise<string> {
  const db = await getDb();
  await db
    .collection<CoverDoc>("assets")
    .updateOne(
      { _id: "cover" },
      { $set: { _id: "cover", data: new Binary(buf), contentType, updatedAt: new Date() } },
      { upsert: true },
    );
  const path = `/api/cover?v=${Date.now()}`;
  await saveContent({ coverImage: path });
  return path;
}

export async function getCover(): Promise<{ buf: Buffer; contentType: string } | null> {
  const db = await getDb();
  const doc = await db.collection<CoverDoc>("assets").findOne({ _id: "cover" });
  if (!doc) return null;
  return { buf: Buffer.from(doc.data.buffer), contentType: doc.contentType };
}
