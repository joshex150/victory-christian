import { Binary, type ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import {
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_SITE_THEME,
  type EmailTemplate,
  type SiteTheme,
} from "./settings";

export type SiteContent = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  body: string;
  bookTitle: string;
  author: string;
  coverEyebrow: string;
  coverEdition: string;
  formHeading: string;
  formMicrocopy: string;
  formBadge: string;
  formEmailLabel: string;
  formPlaceholder: string;
  buttonText: string;
  formLoadingText: string;
  formSubmittedText: string;
  privacyNote: string;
  formInvalidEmailMessage: string;
  formNetworkErrorMessage: string;
  formGenericErrorMessage: string;
  formSuccessMessage: string;
  formExistingMessage: string;
  footerText: string;
  footerCreditLabel: string;
  footerCreditName: string;
  footerCreditUrl: string;
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
  upcomingCoverEyebrow: string;
  upcomingCoverEdition: string;
  upcomingReleaseDate: string;
  upcomingFormHeading: string;
  upcomingFormMicrocopy: string;
  upcomingFormBadge: string;
  upcomingFormEmailLabel: string;
  upcomingFormPlaceholder: string;
  upcomingButtonText: string;
  upcomingFormLoadingText: string;
  upcomingFormSubmittedText: string;
  upcomingPrivacyNote: string;
  upcomingFormInvalidEmailMessage: string;
  upcomingFormNetworkErrorMessage: string;
  upcomingFormGenericErrorMessage: string;
  upcomingFormSuccessMessage: string;
  upcomingFormExistingMessage: string;
  upcomingBooks: UpcomingBook[];
};

export type UpcomingBook = {
  id: string;
  enabled: boolean;
  eyebrow: string;
  title: string;
  author: string;
  subheadline: string;
  body: string;
  coverImage: string;
  coverEyebrow: string;
  coverEdition: string;
  releaseDate: string;
  formHeading: string;
  formMicrocopy: string;
  formBadge: string;
  formEmailLabel: string;
  formPlaceholder: string;
  buttonText: string;
  formLoadingText: string;
  formSubmittedText: string;
  privacyNote: string;
  formInvalidEmailMessage: string;
  formNetworkErrorMessage: string;
  formGenericErrorMessage: string;
  formSuccessMessage: string;
  formExistingMessage: string;
  emailTemplate: EmailTemplate;
};

export const DEFAULT_CONTENT: SiteContent = {
  metadataTitle: "No Guide to Womanhood",
  metadataDescription: "A book for women who are done shrinking. Join the waitlist.",
  eyebrow: "New eBook",
  headline: "You learned the hard way. Not anymore.",
  headlineAccent: "hard way",
  subheadline: "A book for women who are done shrinking.",
  body: `No one hands you a manual for being a woman. Instead, you figure it out through almost-relationships, quiet resentment, people you outgrow, and versions of yourself you have to unlearn.

This book puts words to the things you felt but couldn't explain — the patterns you stayed in too long and the moments you knew better but hoped anyway.

It's not a guide to being a woman, but the clarity you wish you had earlier. Because you don't become her by trying harder, you become her by breaking the pattern.`,
  bookTitle: "No Guide to Womanhood",
  author: "by the author",
  coverEyebrow: "An eBook",
  coverEdition: "Waitlist edition",
  formHeading: "Be first to get it when it drops.",
  formMicrocopy: "No spam, just early access.",
  formBadge: "Waitlist",
  formEmailLabel: "Email address",
  formPlaceholder: "you@yourname.com",
  buttonText: "Sign up today",
  formLoadingText: "Sending...",
  formSubmittedText: "You're in",
  privacyNote: "We respect your privacy. Unsubscribe at any time.",
  formInvalidEmailMessage: "Please enter a valid email address.",
  formNetworkErrorMessage: "Network error. Please try again.",
  formGenericErrorMessage: "Something went wrong. Please try again.",
  formSuccessMessage: "You're on the list. Check your inbox.",
  formExistingMessage: "You're already on the list. We'll be in touch.",
  footerText: "Built for readers who are ready to break the pattern.",
  footerCreditLabel: "Built by",
  footerCreditName: "Yean Technologies",
  footerCreditUrl: "https://yeantech.com",
  coverImage: "",
  releaseDate: "",

  upcomingEnabled: false,
  upcomingEyebrow: "Coming soon",
  upcomingTitle: "",
  upcomingAuthor: "",
  upcomingSubheadline: "",
  upcomingBody: "",
  upcomingCoverImage: "",
  upcomingCoverEyebrow: "Coming soon",
  upcomingCoverEdition: "Advance edition",
  upcomingReleaseDate: "",
  upcomingFormHeading: "Be first to know when it drops.",
  upcomingFormMicrocopy: "Join the early-access list for this upcoming title.",
  upcomingFormBadge: "Upcoming",
  upcomingFormEmailLabel: "Email address",
  upcomingFormPlaceholder: "you@yourname.com",
  upcomingButtonText: "Notify me",
  upcomingFormLoadingText: "Sending...",
  upcomingFormSubmittedText: "You're in",
  upcomingPrivacyNote: "We respect your privacy. Unsubscribe at any time.",
  upcomingFormInvalidEmailMessage: "Please enter a valid email address.",
  upcomingFormNetworkErrorMessage: "Network error. Please try again.",
  upcomingFormGenericErrorMessage: "Something went wrong. Please try again.",
  upcomingFormSuccessMessage: "You're on the list. Check your inbox.",
  upcomingFormExistingMessage: "You're already on the list. We'll be in touch.",
  upcomingBooks: [],
};

export type SubscriberList = "main" | `book:${string}`;

export type Subscriber = {
  email: string;
  createdAt: string;
  ip?: string | null;
  ua?: string | null;
  list?: SubscriberList;
};

type ContentDoc = SiteContent & { _id: "site" };
type ThemeDoc = SiteTheme & { _id: "theme" };
type EmailTemplateDoc = EmailTemplate & { _id: "email-template" };
type SubscriberDoc = Subscriber & { _id?: ObjectId };
type CoverDoc = {
  _id: string;
  data: Binary;
  contentType: string;
  updatedAt: Date;
};

function subscribersCollection(list: SubscriberList) {
  if (list === "main") return "subscribers";
  const bookId = list.slice("book:".length);
  assertBookId(bookId);
  return bookId === "upcoming"
    ? "upcoming_subscribers"
    : `upcoming_subscribers_${bookId}`;
}

const BOOK_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isBookId(value: string): boolean {
  return BOOK_ID_RE.test(value) && value.length <= 60;
}

function assertBookId(value: string) {
  if (!isBookId(value)) throw new Error("Invalid upcoming book ID.");
}

export function bookSubscriberList(bookId: string): SubscriberList {
  assertBookId(bookId);
  return `book:${bookId}`;
}

function legacyUpcomingBook(content: SiteContent): UpcomingBook | null {
  if (
    !content.upcomingEnabled &&
    !content.upcomingTitle.trim() &&
    !content.upcomingCoverImage.trim()
  ) {
    return null;
  }
  return {
    id: "upcoming",
    enabled: content.upcomingEnabled,
    eyebrow: content.upcomingEyebrow,
    title: content.upcomingTitle,
    author: content.upcomingAuthor,
    subheadline: content.upcomingSubheadline,
    body: content.upcomingBody,
    coverImage: content.upcomingCoverImage,
    coverEyebrow: content.upcomingCoverEyebrow,
    coverEdition: content.upcomingCoverEdition,
    releaseDate: content.upcomingReleaseDate,
    formHeading: content.upcomingFormHeading,
    formMicrocopy: content.upcomingFormMicrocopy,
    formBadge: content.upcomingFormBadge,
    formEmailLabel: content.upcomingFormEmailLabel,
    formPlaceholder: content.upcomingFormPlaceholder,
    buttonText: content.upcomingButtonText,
    formLoadingText: content.upcomingFormLoadingText,
    formSubmittedText: content.upcomingFormSubmittedText,
    privacyNote: content.upcomingPrivacyNote,
    formInvalidEmailMessage: content.upcomingFormInvalidEmailMessage,
    formNetworkErrorMessage: content.upcomingFormNetworkErrorMessage,
    formGenericErrorMessage: content.upcomingFormGenericErrorMessage,
    formSuccessMessage: content.upcomingFormSuccessMessage,
    formExistingMessage: content.upcomingFormExistingMessage,
    emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE },
  };
}

function normaliseUpcomingBook(book: UpcomingBook): UpcomingBook {
  return {
    ...book,
    emailTemplate: { ...DEFAULT_EMAIL_TEMPLATE, ...book.emailTemplate },
  };
}

/* -------- content -------- */

export async function getContent(): Promise<SiteContent> {
  const db = await getDb();
  const doc = await db.collection<ContentDoc>("meta").findOne({ _id: "site" });
  if (!doc) return { ...DEFAULT_CONTENT };
  const { _id, ...rest } = doc;
  void _id;
  const content: SiteContent = { ...DEFAULT_CONTENT, ...rest };
  if (Array.isArray(rest.upcomingBooks)) {
    content.upcomingBooks = rest.upcomingBooks
      .filter((book) => isBookId(book.id))
      .map(normaliseUpcomingBook);
  } else {
    const legacy = legacyUpcomingBook(content);
    content.upcomingBooks = legacy ? [legacy] : [];
  }
  return content;
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

/* -------- appearance and email template -------- */

export async function getSiteTheme(): Promise<SiteTheme> {
  const db = await getDb();
  const doc = await db.collection<ThemeDoc>("meta").findOne({ _id: "theme" });
  if (!doc) return { ...DEFAULT_SITE_THEME };
  const { _id, ...rest } = doc;
  void _id;
  return { ...DEFAULT_SITE_THEME, ...rest };
}

export async function saveSiteTheme(theme: SiteTheme): Promise<SiteTheme> {
  const db = await getDb();
  await db
    .collection<ThemeDoc>("meta")
    .updateOne({ _id: "theme" }, { $set: { ...theme, _id: "theme" } }, { upsert: true });
  return theme;
}

export async function getEmailTemplate(): Promise<EmailTemplate> {
  const db = await getDb();
  const doc = await db
    .collection<EmailTemplateDoc>("meta")
    .findOne({ _id: "email-template" });
  if (!doc) return { ...DEFAULT_EMAIL_TEMPLATE };
  const { _id, ...rest } = doc;
  void _id;
  return { ...DEFAULT_EMAIL_TEMPLATE, ...rest };
}

export async function saveEmailTemplate(template: EmailTemplate): Promise<EmailTemplate> {
  const db = await getDb();
  await db
    .collection<EmailTemplateDoc>("meta")
    .updateOne(
      { _id: "email-template" },
      { $set: { ...template, _id: "email-template" } },
      { upsert: true },
    );
  return template;
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
    if (list !== "main" && list !== "book:upcoming") {
      await col.createIndex({ email: 1 }, { unique: true });
      await col.createIndex({ createdAt: -1 });
    }
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

export type CoverKind = "main" | `book:${string}`;

function coverDocId(kind: CoverKind): string {
  if (kind === "main") return "cover";
  const bookId = kind.slice("book:".length);
  assertBookId(bookId);
  return bookId === "upcoming" ? "upcoming-cover" : `upcoming-cover:${bookId}`;
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
    kind === "main"
      ? `/api/cover?v=${Date.now()}`
      : `/api/cover/upcoming?bookId=${encodeURIComponent(kind.slice("book:".length))}&v=${Date.now()}`;
  if (kind === "main") {
    await saveContent({ coverImage: path });
  } else {
    const bookId = kind.slice("book:".length);
    const content = await getContent();
    if (!content.upcomingBooks.some((book) => book.id === bookId)) {
      throw new Error("Save the upcoming book before uploading its cover.");
    }
    await saveContent({
      upcomingBooks: content.upcomingBooks.map((book) =>
        book.id === bookId ? { ...book, coverImage: path } : book,
      ),
    });
  }
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
