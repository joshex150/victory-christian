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

  // Secondary "upcoming book" — hidden by default; when disabled the
  // landing page renders exactly as before.
  upcomingEnabled: boolean;
  upcomingEyebrow: string;
  upcomingTitle: string;
  upcomingAuthor: string;
  upcomingSubheadline: string;
  upcomingBody: string;
  upcomingCoverImage: string;
  upcomingReleaseDate: string;
  upcomingFormHeading: string;
  upcomingFormMicrocopy: string;
  upcomingButtonText: string;
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

  upcomingEnabled: false,
  upcomingEyebrow: "Coming soon",
  upcomingTitle: "",
  upcomingAuthor: "",
  upcomingSubheadline: "",
  upcomingBody: "",
  upcomingCoverImage: "",
  upcomingReleaseDate: "",
  upcomingFormHeading: "Be first to know when it drops.",
  upcomingFormMicrocopy: "Join the early-access list for this upcoming title.",
  upcomingButtonText: "Notify me",
};

export type SubscriberList = "main" | "upcoming";

export type Subscriber = {
  email: string;
  createdAt: string;
  ip?: string | null;
  ua?: string | null;
  list?: SubscriberList;
};

type ContentDoc = SiteContent & { _id: "site" };
type SubscriberDoc = Subscriber & { _id?: ObjectId };
type CoverDoc = {
  _id: "cover" | "upcoming-cover";
  data: Binary;
  contentType: string;
  updatedAt: Date;
};

function subscribersCollection(list: SubscriberList) {
  return list === "upcoming" ? "upcoming_subscribers" : "subscribers";
}

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

export async function getSubscribers(list: SubscriberList = "main"): Promise<Subscriber[]> {
  const db = await getDb();
  const docs = await db
    .collection<SubscriberDoc>(subscribersCollection(list))
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs as Subscriber[];
}

export async function addSubscriber(
  entry: Subscriber,
  list: SubscriberList = "main",
): Promise<{ added: boolean; total: number }> {
  const db = await getDb();
  const col = db.collection<SubscriberDoc>(subscribersCollection(list));
  const email = entry.email.toLowerCase();
  try {
    await col.insertOne({ ...entry, email, list });
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

export async function removeSubscriber(
  email: string,
  list: SubscriberList = "main",
): Promise<number> {
  const db = await getDb();
  const col = db.collection<SubscriberDoc>(subscribersCollection(list));
  await col.deleteOne({ email: email.toLowerCase() });
  return col.countDocuments();
}

/* -------- cover image (stored as binary in Mongo) -------- */

export type CoverKind = "main" | "upcoming";

function coverDocId(kind: CoverKind): "cover" | "upcoming-cover" {
  return kind === "upcoming" ? "upcoming-cover" : "cover";
}

export async function saveCover(
  buf: Buffer,
  contentType: string,
  kind: CoverKind = "main",
): Promise<string> {
  const db = await getDb();
  const id = coverDocId(kind);
  await db
    .collection<CoverDoc>("assets")
    .updateOne(
      { _id: id },
      { $set: { _id: id, data: new Binary(buf), contentType, updatedAt: new Date() } },
      { upsert: true },
    );
  const path =
    kind === "upcoming"
      ? `/api/cover/upcoming?v=${Date.now()}`
      : `/api/cover?v=${Date.now()}`;
  await saveContent(kind === "upcoming" ? { upcomingCoverImage: path } : { coverImage: path });
  return path;
}

export async function getCover(
  kind: CoverKind = "main",
): Promise<{ buf: Buffer; contentType: string } | null> {
  const db = await getDb();
  const doc = await db.collection<CoverDoc>("assets").findOne({ _id: coverDocId(kind) });
  if (!doc) return null;
  return { buf: Buffer.from(doc.data.buffer), contentType: doc.contentType };
}
