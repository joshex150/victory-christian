import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

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
  coverImage: string; // public path like /uploads/cover.jpg or external URL
  releaseDate: string; // ISO or display string, optional
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

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(file: string, value: unknown) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

export async function getContent(): Promise<SiteContent> {
  const stored = await readJSON<Partial<SiteContent>>(CONTENT_FILE, {});
  return { ...DEFAULT_CONTENT, ...stored };
}

export async function saveContent(patch: Partial<SiteContent>): Promise<SiteContent> {
  const current = await getContent();
  const next: SiteContent = { ...current, ...patch };
  await writeJSON(CONTENT_FILE, next);
  return next;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  return readJSON<Subscriber[]>(SUBSCRIBERS_FILE, []);
}

export async function addSubscriber(entry: Subscriber): Promise<{ added: boolean; total: number }> {
  const list = await getSubscribers();
  const exists = list.some((s) => s.email.toLowerCase() === entry.email.toLowerCase());
  if (exists) return { added: false, total: list.length };
  list.push(entry);
  await writeJSON(SUBSCRIBERS_FILE, list);
  return { added: true, total: list.length };
}

export async function removeSubscriber(email: string): Promise<number> {
  const list = await getSubscribers();
  const next = list.filter((s) => s.email.toLowerCase() !== email.toLowerCase());
  await writeJSON(SUBSCRIBERS_FILE, next);
  return next.length;
}
