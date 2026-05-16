"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BookCover from "@/components/BookCover";
import type { SiteContent, Subscriber } from "@/lib/storage";

type Tab = "content" | "cover" | "subscribers";

export default function Dashboard({
  adminEmail,
  initialContent,
  initialSubscribers,
}: {
  adminEmail: string;
  initialContent: SiteContent;
  initialSubscribers: Subscriber[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("content");
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [draft, setDraft] = useState<SiteContent>(initialContent);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(content),
    [draft, content],
  );

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  async function saveDraft() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { success: boolean; content?: SiteContent; message?: string };
      if (!res.ok || !data.success || !data.content) {
        toast.error(data.message || "Failed to save.");
        return;
      }
      setContent(data.content);
      setDraft(data.content);
      toast.success("Saved.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  function resetDraft() {
    setDraft(content);
    toast.message("Changes discarded.");
  }

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json()) as { success: boolean; content?: SiteContent; message?: string };
      if (!res.ok || !data.success || !data.content) {
        toast.error(data.message || "Upload failed.");
        return;
      }
      setContent(data.content);
      setDraft(data.content);
      toast.success("Cover image updated.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearCover() {
    setDraft({ ...draft, coverImage: "" });
  }

  async function refreshSubscribers() {
    const res = await fetch("/api/admin/subscribers");
    if (res.ok) {
      const data = (await res.json()) as { subscribers: Subscriber[] };
      setSubscribers(data.subscribers);
    }
  }

  async function removeSub(email: string) {
    if (!confirm(`Remove ${email}?`)) return;
    const res = await fetch("/api/admin/subscribers", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setSubscribers((list) => list.filter((s) => s.email !== email));
      toast.success("Removed.");
    } else {
      toast.error("Could not remove.");
    }
  }

  return (
    <main className="min-h-screen bg-cream paper-grain">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/75 border-b border-blush-deep/60">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose to-wine flex items-center justify-center text-white font-serif text-lg shadow-[0_8px_18px_-8px_rgba(176,44,84,0.7)]">
              N
            </div>
            <div className="min-w-0">
              <div className="text-[11px] tracking-[0.24em] uppercase text-mute">Admin</div>
              <div className="font-serif text-ink truncate" style={{ fontFamily: "var(--font-serif)" }}>
                {content.bookTitle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-white text-sm text-ink-soft hover:border-rose/50 transition-colors"
            >
              View site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" /><path d="M7 7h10v10" />
              </svg>
            </a>
            <button
              onClick={logout}
              className="h-9 px-3 rounded-[10px] border border-blush-deep bg-white text-sm text-ink-soft hover:border-rose/50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 py-8 sm:py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1
            className="font-serif text-3xl sm:text-4xl text-ink"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Hi, {adminEmail.split("@")[0]}.
          </h1>
          <p className="mt-1.5 text-mute text-sm">
            You have <span className="text-rose-deep font-semibold">{subscribers.length}</span>{" "}
            {subscribers.length === 1 ? "subscriber" : "subscribers"} on the waitlist.
          </p>
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-[12px] border border-blush-deep bg-white/70 backdrop-blur-md mb-6">
          {(
            [
              ["content", "Write-up"],
              ["cover", "Book cover"],
              ["subscribers", "Subscribers"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 sm:px-5 h-9 rounded-[9px] text-sm font-medium transition-all ${
                tab === key
                  ? "bg-rose-deep text-white shadow-[0_8px_18px_-8px_rgba(176,44,84,0.7)]"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "content" && (
          <ContentTab
            draft={draft}
            setDraft={setDraft}
            dirty={dirty}
            saving={saving}
            onSave={saveDraft}
            onReset={resetDraft}
          />
        )}

        {tab === "cover" && (
          <CoverTab
            draft={draft}
            content={content}
            uploading={uploading}
            fileRef={fileRef}
            onPickFile={onPickFile}
            onCoverChange={(url) => setDraft({ ...draft, coverImage: url })}
            onClear={clearCover}
            dirty={dirty}
            saving={saving}
            onSave={saveDraft}
            onReset={resetDraft}
          />
        )}

        {tab === "subscribers" && (
          <SubscribersTab
            subscribers={subscribers}
            onRefresh={refreshSubscribers}
            onRemove={removeSub}
          />
        )}
      </div>
    </main>
  );
}

/* ------------------- Tabs ------------------- */

function ContentTab({
  draft,
  setDraft,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  draft: SiteContent;
  setDraft: (c: SiteContent) => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft({ ...draft, [key]: value });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      <div className="rounded-[18px] border border-blush-deep/60 bg-white p-6 sm:p-7">
        <SectionTitle title="Headline & body" desc="The voice of the page." />
        <Field label="Eyebrow" value={draft.eyebrow} onChange={(v) => set("eyebrow", v)} />
        <Field label="Book title" value={draft.bookTitle} onChange={(v) => set("bookTitle", v)} />
        <Field label="Author / Byline" value={draft.author} onChange={(v) => set("author", v)} />
        <Field
          label="Headline"
          value={draft.headline}
          onChange={(v) => set("headline", v)}
          multiline
        />
        <Field
          label="Subheadline"
          value={draft.subheadline}
          onChange={(v) => set("subheadline", v)}
          multiline
        />
        <Field
          label="Body"
          value={draft.body}
          onChange={(v) => set("body", v)}
          multiline
          rows={9}
          help="Use blank lines to separate paragraphs."
        />

        <SectionTitle title="Waitlist form" className="mt-8" />
        <Field
          label="Form heading"
          value={draft.formHeading}
          onChange={(v) => set("formHeading", v)}
        />
        <Field
          label="Microcopy"
          value={draft.formMicrocopy}
          onChange={(v) => set("formMicrocopy", v)}
        />
        <Field
          label="Button text"
          value={draft.buttonText}
          onChange={(v) => set("buttonText", v)}
        />
        <Field
          label="Privacy note"
          value={draft.privacyNote}
          onChange={(v) => set("privacyNote", v)}
        />

        <SectionTitle title="Footer" className="mt-8" />
        <Field
          label="Footer text"
          value={draft.footerText}
          onChange={(v) => set("footerText", v)}
        />
      </div>

      <aside className="lg:sticky lg:top-24 self-start">
        <div className="rounded-[18px] border border-blush-deep/60 bg-gradient-to-br from-blush/50 to-white p-6">
          <div className="text-[11px] tracking-[0.24em] uppercase text-rose-deep mb-3">Live preview</div>
          <div className="rounded-[14px] bg-white p-5 border border-blush-deep/50">
            <div className="text-[10px] tracking-[0.28em] uppercase text-rose-deep">{draft.eyebrow}</div>
            <h3
              className="mt-2 font-serif text-2xl leading-tight text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {draft.headline}
            </h3>
            <p
              className="mt-2 font-serif italic text-mute"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {draft.subheadline}
            </p>
            <p className="mt-3 text-[13px] text-ink-soft line-clamp-6 whitespace-pre-line">
              {draft.body}
            </p>
            <div className="mt-4 pt-3 border-t border-blush-deep/40">
              <div
                className="font-serif italic text-ink text-sm"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {draft.bookTitle}
              </div>
              <div className="text-[11px] text-mute">{draft.author}</div>
            </div>
          </div>
        </div>

        <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
      </aside>
    </div>
  );
}

function CoverTab({
  draft,
  content,
  uploading,
  fileRef,
  onPickFile,
  onCoverChange,
  onClear,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  draft: SiteContent;
  content: SiteContent;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onPickFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (url: string) => void;
  onClear: () => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      <div className="rounded-[18px] border border-blush-deep/60 bg-white p-6 sm:p-7">
        <SectionTitle
          title="Book cover image"
          desc="Upload a JPG, PNG, WebP, GIF, or AVIF (max 8 MB). Portrait images work best."
        />

        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-[14px] border-2 border-dashed border-blush-deep bg-blush/30 hover:bg-blush/50 transition-colors p-8 text-center"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-white border border-blush-deep flex items-center justify-center text-rose-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
          </div>
          <div className="mt-3 text-sm font-medium text-ink">
            {uploading ? "Uploading…" : "Click to upload a new cover"}
          </div>
          <div className="text-xs text-mute mt-1">or drag & drop a file here</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={onPickFile}
          />
        </div>

        <div className="mt-6">
          <label className="block text-xs font-medium text-ink-soft mb-1.5">
            Or paste an image URL
          </label>
          <input
            value={draft.coverImage}
            onChange={(e) => onCoverChange(e.target.value)}
            placeholder="https://…"
            className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-white px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors"
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-mute">Either upload, or point to an externally-hosted image.</p>
            {draft.coverImage && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-rose-deep hover:underline"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="self-start">
        <div className="rounded-[18px] border border-blush-deep/60 bg-gradient-to-br from-blush/50 to-white p-6">
          <div className="text-[11px] tracking-[0.24em] uppercase text-rose-deep mb-5 text-center">
            Live preview
          </div>
          <div className="flex justify-center py-4">
            <BookCover
              title={draft.bookTitle}
              author={draft.author}
              image={draft.coverImage}
            />
          </div>
          {content.coverImage !== draft.coverImage && (
            <p className="mt-4 text-center text-xs text-rose-deep">
              Unsaved cover change — click Save to publish.
            </p>
          )}
        </div>
        <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
      </aside>
    </div>
  );
}

function SubscribersTab({
  subscribers,
  onRefresh,
  onRemove,
}: {
  subscribers: Subscriber[];
  onRefresh: () => void;
  onRemove: (email: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      q
        ? subscribers.filter((s) =>
            s.email.toLowerCase().includes(q.toLowerCase()),
          )
        : subscribers,
    [q, subscribers],
  );

  return (
    <div className="rounded-[18px] border border-blush-deep/60 bg-white p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <SectionTitle title="Waitlist subscribers" desc={`${subscribers.length} total`} className="m-0" />
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/subscribers?format=csv"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-white text-sm text-ink-soft hover:border-rose/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </a>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-white text-sm text-ink-soft hover:border-rose/50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by email…"
        className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-white px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors mb-5"
      />

      {filtered.length === 0 ? (
        <div className="py-14 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-blush flex items-center justify-center text-rose-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" />
            </svg>
          </div>
          <p className="mt-3 text-mute text-sm">
            {subscribers.length === 0 ? "No subscribers yet." : "No matches."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-blush-deep/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blush/40 text-ink-soft text-left">
                <th className="font-medium px-4 py-2.5">Email</th>
                <th className="font-medium px-4 py-2.5 hidden sm:table-cell">Joined</th>
                <th className="font-medium px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.email} className="border-t border-blush-deep/40">
                  <td className="px-4 py-3 text-ink truncate">{s.email}</td>
                  <td className="px-4 py-3 text-mute hidden sm:table-cell">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRemove(s.email)}
                      className="text-rose-deep hover:underline text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------- bits ------------------- */

function SectionTitle({
  title,
  desc,
  className = "",
}: {
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <h2
        className="font-serif text-xl text-ink"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h2>
      {desc && <p className="text-xs text-mute mt-1">{desc}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  help?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className="focus-rose w-full rounded-[10px] border border-blush-deep bg-white px-3.5 py-2.5 text-[15px] text-ink hover:border-rose/50 transition-colors leading-relaxed resize-y"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-white px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors"
        />
      )}
      {help && <span className="block mt-1 text-[11px] text-mute">{help}</span>}
    </label>
  );
}

function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border border-blush-deep/60 bg-white/85 backdrop-blur-md">
      <span className="text-xs text-mute">
        {dirty ? "You have unsaved changes." : "All changes saved."}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onReset}
          disabled={!dirty || saving}
          className="h-9 px-3 rounded-[10px] border border-blush-deep bg-white text-sm text-ink-soft hover:border-rose/50 transition-colors disabled:opacity-50"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="h-9 px-4 rounded-[10px] bg-rose-deep text-white text-sm font-medium hover:bg-wine transition-colors disabled:opacity-50 shadow-[0_8px_18px_-8px_rgba(176,44,84,0.7)]"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
