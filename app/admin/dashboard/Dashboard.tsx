"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BookCover from "@/components/BookCover";
import { fillTemplate, themeStyle, type EmailTemplate, type SiteTheme } from "@/lib/settings";
import type { SiteContent, Subscriber } from "@/lib/storage";

type Tab = "content" | "cover" | "theme" | "email" | "subscribers" | "upcoming";

export default function Dashboard({
  adminEmail,
  initialContent,
  initialTheme,
  initialEmailTemplate,
  initialSubscribers,
  initialUpcomingSubscribers,
}: {
  adminEmail: string;
  initialContent: SiteContent;
  initialTheme: SiteTheme;
  initialEmailTemplate: EmailTemplate;
  initialSubscribers: Subscriber[];
  initialUpcomingSubscribers: Subscriber[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("content");
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [draft, setDraft] = useState<SiteContent>(initialContent);
  const [theme, setTheme] = useState<SiteTheme>(initialTheme);
  const [themeDraft, setThemeDraft] = useState<SiteTheme>(initialTheme);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(initialEmailTemplate);
  const [emailDraft, setEmailDraft] = useState<EmailTemplate>(initialEmailTemplate);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [upcomingSubscribers, setUpcomingSubscribers] = useState<Subscriber[]>(
    initialUpcomingSubscribers,
  );
  const [saving, setSaving] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingUpcoming, setUploadingUpcoming] = useState(false);
  const [removingSubscriber, setRemovingSubscriber] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upcomingFileRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(content),
    [draft, content],
  );
  const themeDirty = useMemo(
    () => JSON.stringify(themeDraft) !== JSON.stringify(theme),
    [themeDraft, theme],
  );
  const emailDirty = useMemo(
    () => JSON.stringify(emailDraft) !== JSON.stringify(emailTemplate),
    [emailDraft, emailTemplate],
  );

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  async function saveDraft() {
    setSaving(true);
    try {
      const { upcomingBooks: _reservedUpcomingBooks, ...contentPatch } = draft;
      void _reservedUpcomingBooks;
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(contentPatch),
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

  async function saveTheme() {
    setSavingTheme(true);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(themeDraft),
      });
      const data = (await res.json()) as { success: boolean; theme?: SiteTheme; message?: string };
      if (!res.ok || !data.success || !data.theme) {
        toast.error(data.message || "Failed to save theme.");
        return;
      }
      setTheme(data.theme);
      setThemeDraft(data.theme);
      for (const [key, value] of Object.entries(themeStyle(data.theme))) {
        if (typeof value === "string") document.documentElement.style.setProperty(key, value);
      }
      toast.success("Theme published.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingTheme(false);
    }
  }

  function resetTheme() {
    setThemeDraft(theme);
    toast.message("Theme changes discarded.");
  }

  async function saveEmailTemplate() {
    setSavingEmail(true);
    try {
      const res = await fetch("/api/admin/email-template", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(emailDraft),
      });
      const data = (await res.json()) as {
        success: boolean;
        template?: EmailTemplate;
        message?: string;
      };
      if (!res.ok || !data.success || !data.template) {
        toast.error(data.message || "Failed to save email template.");
        return;
      }
      setEmailTemplate(data.template);
      setEmailDraft(data.template);
      toast.success("Email template saved.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingEmail(false);
    }
  }

  function resetEmailTemplate() {
    setEmailDraft(emailTemplate);
    toast.message("Email changes discarded.");
  }

  async function uploadCover(
    e: ChangeEvent<HTMLInputElement>,
    kind: "main" | "upcoming",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const setBusy = kind === "upcoming" ? setUploadingUpcoming : setUploading;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
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
      setBusy(false);
      const ref = kind === "upcoming" ? upcomingFileRef : fileRef;
      if (ref.current) ref.current.value = "";
    }
  }

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    return uploadCover(e, "main");
  }

  function onPickUpcomingFile(e: ChangeEvent<HTMLInputElement>) {
    return uploadCover(e, "upcoming");
  }

  function clearCover() {
    setDraft({ ...draft, coverImage: "" });
  }

  function clearUpcomingCover() {
    setDraft({ ...draft, upcomingCoverImage: "" });
  }

  async function refreshSubscribers(list: "main" | "upcoming" = "main") {
    const res = await fetch(`/api/admin/subscribers?list=${list}`);
    if (res.ok) {
      const data = (await res.json()) as { subscribers: Subscriber[] };
      if (list === "upcoming") setUpcomingSubscribers(data.subscribers);
      else setSubscribers(data.subscribers);
    }
  }

  async function removeSub(email: string, list: "main" | "upcoming" = "main") {
    const removalKey = `${list}:${email}`;
    setRemovingSubscriber(removalKey);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, list }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not remove subscriber.");
        return;
      }
      if (list === "upcoming") {
        setUpcomingSubscribers((l) => l.filter((s) => s.email !== email));
      } else {
        setSubscribers((l) => l.filter((s) => s.email !== email));
      }
      toast.success("Removed.");
    } catch {
      toast.error("Network error while removing subscriber.");
    } finally {
      setRemovingSubscriber((current) => (current === removalKey ? null : current));
    }
  }

  return (
    <main className="min-h-screen bg-cream paper-grain">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-surface/75 border-b border-blush-deep/60">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shadow-action h-8 w-8 rounded-lg bg-gradient-to-br from-rose to-button-hover flex items-center justify-center text-button-text font-serif text-lg">
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
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-surface text-sm text-ink-soft hover:border-rose/50 transition-colors"
            >
              View site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" /><path d="M7 7h10v10" />
              </svg>
            </a>
            <button
              onClick={logout}
              className="h-9 px-3 rounded-[10px] border border-blush-deep bg-surface text-sm text-ink-soft hover:border-rose/50 transition-colors"
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
        <div className="flex w-full overflow-x-auto no-scrollbar sm:w-auto sm:inline-flex p-1 rounded-[12px] border border-blush-deep bg-surface/70 backdrop-blur-md mb-6">
          {(
            [
              ["content", "Write-up"],
              ["cover", "Book cover"],
              ["theme", "Theme"],
              ["email", "Email"],
              ["upcoming", "Upcoming book"],
              ["subscribers", "Subscribers"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`shrink-0 px-4 sm:px-5 h-9 rounded-[9px] text-sm font-medium transition-all ${
                tab === key
                  ? "shadow-action bg-button text-button-text"
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
            onCoverCopyChange={(patch) => setDraft({ ...draft, ...patch })}
            onClear={clearCover}
            dirty={dirty}
            saving={saving}
            onSave={saveDraft}
            onReset={resetDraft}
          />
        )}

        {tab === "theme" && (
          <ThemeTab
            draft={themeDraft}
            setDraft={setThemeDraft}
            content={draft}
            dirty={themeDirty}
            saving={savingTheme}
            onSave={saveTheme}
            onReset={resetTheme}
          />
        )}

        {tab === "email" && (
          <EmailTemplateTab
            draft={emailDraft}
            setDraft={setEmailDraft}
            content={draft}
            dirty={emailDirty}
            saving={savingEmail}
            onSave={saveEmailTemplate}
            onReset={resetEmailTemplate}
          />
        )}

        {tab === "upcoming" && (
          <UpcomingTab
            draft={draft}
            content={content}
            setDraft={setDraft}
            uploading={uploadingUpcoming}
            fileRef={upcomingFileRef}
            onPickFile={onPickUpcomingFile}
            onCoverChange={(url) => setDraft({ ...draft, upcomingCoverImage: url })}
            onClearCover={clearUpcomingCover}
            dirty={dirty}
            saving={saving}
            onSave={saveDraft}
            onReset={resetDraft}
            upcomingSubscribers={upcomingSubscribers}
            onRefreshUpcoming={() => refreshSubscribers("upcoming")}
            onRemoveUpcoming={(email) => removeSub(email, "upcoming")}
            removingSubscriber={removingSubscriber}
          />
        )}

        {tab === "subscribers" && (
          <SubscribersTab
            subscribers={subscribers}
            onRefresh={() => refreshSubscribers("main")}
            onRemove={(email) => removeSub(email, "main")}
            removingSubscriber={removingSubscriber}
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
      <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
        <SectionTitle title="Browser and sharing" desc="Used in tabs and social link previews." />
        <Field
          label="Page title"
          value={draft.metadataTitle}
          onChange={(v) => set("metadataTitle", v)}
        />
        <Field
          label="Page description"
          value={draft.metadataDescription}
          onChange={(v) => set("metadataDescription", v)}
          multiline
        />

        <SectionTitle title="Headline & body" desc="The voice of the page." className="mt-8" />
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
          label="Highlighted headline phrase"
          value={draft.headlineAccent}
          onChange={(v) => set("headlineAccent", v)}
          help="If this phrase is found in the headline, it receives the accent underline."
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
        <Field label="Badge" value={draft.formBadge} onChange={(v) => set("formBadge", v)} />
        <Field
          label="Name field label"
          value={draft.formNameLabel}
          onChange={(v) => set("formNameLabel", v)}
        />
        <Field
          label="Name placeholder"
          value={draft.formNamePlaceholder}
          onChange={(v) => set("formNamePlaceholder", v)}
          help="Keep this soft. The public field is optional to reduce friction."
        />
        <Field
          label="Email field label"
          value={draft.formEmailLabel}
          onChange={(v) => set("formEmailLabel", v)}
        />
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
          label="Email placeholder"
          value={draft.formPlaceholder}
          onChange={(v) => set("formPlaceholder", v)}
        />
        <Field
          label="Submitting button text"
          value={draft.formLoadingText}
          onChange={(v) => set("formLoadingText", v)}
        />
        <Field
          label="Submitted button text"
          value={draft.formSubmittedText}
          onChange={(v) => set("formSubmittedText", v)}
        />
        <Field
          label="Privacy note"
          value={draft.privacyNote}
          onChange={(v) => set("privacyNote", v)}
        />
        <SectionTitle title="Waitlist responses" className="mt-8" />
        <Field
          label="Invalid email message"
          value={draft.formInvalidEmailMessage}
          onChange={(v) => set("formInvalidEmailMessage", v)}
        />
        <Field
          label="Network error message"
          value={draft.formNetworkErrorMessage}
          onChange={(v) => set("formNetworkErrorMessage", v)}
        />
        <Field
          label="General error message"
          value={draft.formGenericErrorMessage}
          onChange={(v) => set("formGenericErrorMessage", v)}
        />
        <Field
          label="Successful signup message"
          value={draft.formSuccessMessage}
          onChange={(v) => set("formSuccessMessage", v)}
        />
        <Field
          label="Already subscribed message"
          value={draft.formExistingMessage}
          onChange={(v) => set("formExistingMessage", v)}
        />

        <SectionTitle title="Footer" className="mt-8" />
        <Field
          label="Footer text"
          value={draft.footerText}
          onChange={(v) => set("footerText", v)}
        />
        <Field
          label="Credit label"
          value={draft.footerCreditLabel}
          onChange={(v) => set("footerCreditLabel", v)}
        />
        <Field
          label="Credit name"
          value={draft.footerCreditName}
          onChange={(v) => set("footerCreditName", v)}
        />
        <Field
          label="Credit URL"
          value={draft.footerCreditUrl}
          onChange={(v) => set("footerCreditUrl", v)}
        />
      </div>

      <aside className="lg:sticky lg:top-24 self-start">
        <div className="rounded-[18px] border border-blush-deep/60 bg-gradient-to-br from-blush/50 to-surface p-6">
          <div className="text-[11px] tracking-[0.24em] uppercase text-rose-deep mb-3">Live preview</div>
          <div className="rounded-[14px] bg-surface p-5 border border-blush-deep/50">
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
  onCoverCopyChange,
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
  onCoverCopyChange: (patch: Partial<Pick<SiteContent, "coverEyebrow" | "coverEdition">>) => void;
  onClear: () => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
        <SectionTitle
          title="Book cover image"
          desc="Upload a JPG, PNG, WebP, GIF, or AVIF (max 8 MB). Portrait images work best."
        />
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field
            label="Fallback cover eyebrow"
            value={draft.coverEyebrow}
            onChange={(v) => onCoverCopyChange({ coverEyebrow: v })}
          />
          <Field
            label="Fallback cover edition"
            value={draft.coverEdition}
            onChange={(v) => onCoverCopyChange({ coverEdition: v })}
          />
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-[14px] border-2 border-dashed border-blush-deep bg-blush/30 hover:bg-blush/50 transition-colors p-8 text-center"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-surface border border-blush-deep flex items-center justify-center text-rose-deep">
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
            className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-input px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors"
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
        <div className="rounded-[18px] border border-blush-deep/60 bg-gradient-to-br from-blush/50 to-surface p-6">
          <div className="text-[11px] tracking-[0.24em] uppercase text-rose-deep mb-5 text-center">
            Live preview
          </div>
          <div className="flex justify-center py-4">
            <BookCover
              title={draft.bookTitle}
              author={draft.author}
              eyebrow={draft.coverEyebrow}
              edition={draft.coverEdition}
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

const THEME_GROUPS: Array<{
  title: string;
  fields: Array<{ key: keyof SiteTheme; label: string }>;
}> = [
  {
    title: "Page and surfaces",
    fields: [
      { key: "pageBackground", label: "Page background" },
      { key: "surface", label: "Cards" },
      { key: "softSurface", label: "Soft accent" },
      { key: "border", label: "Borders" },
    ],
  },
  {
    title: "Typography and accents",
    fields: [
      { key: "headingText", label: "Headings" },
      { key: "bodyText", label: "Body text" },
      { key: "mutedText", label: "Muted text" },
      { key: "accent", label: "Accent" },
      { key: "accentDeep", label: "Deep accent" },
    ],
  },
  {
    title: "Buttons and fields",
    fields: [
      { key: "buttonBackground", label: "Button" },
      { key: "buttonHover", label: "Button hover" },
      { key: "buttonText", label: "Button text" },
      { key: "badgeBackground", label: "Badge" },
      { key: "badgeText", label: "Badge text" },
      { key: "inputBackground", label: "Input" },
    ],
  },
  {
    title: "Toast and cover",
    fields: [
      { key: "toastBackground", label: "Toast" },
      { key: "toastBorder", label: "Toast border" },
      { key: "toastText", label: "Toast text" },
      { key: "coverBackground", label: "Cover paper" },
      { key: "coverAccent", label: "Cover accent" },
    ],
  },
];

function ThemeTab({
  draft,
  setDraft,
  content,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  draft: SiteTheme;
  setDraft: (theme: SiteTheme) => void;
  content: SiteContent;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_440px] gap-6">
      <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
        <SectionTitle title="Site theme" desc="Color system for the public site and notifications." />
        <div className="space-y-7">
          {THEME_GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="text-xs font-semibold text-ink-soft mb-3">{group.title}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {group.fields.map(({ key, label }) => (
                  <ColorField
                    key={key}
                    label={label}
                    value={draft[key]}
                    onChange={(value) => setDraft({ ...draft, [key]: value })}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 self-start">
        <div
          style={themeStyle(draft)}
          className="overflow-hidden rounded-[18px] border border-blush-deep bg-cream"
        >
          <div className="h-[3px] bg-rose-deep" />
          <div className="p-5 sm:p-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blush-deep bg-blush text-rose-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-deep" />
              <span className="text-[10px] uppercase font-medium">{content.eyebrow}</span>
            </div>
            <h3
              className="mt-4 font-serif text-[28px] leading-tight text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {content.bookTitle}
            </h3>
            <p className="mt-2 text-sm text-ink-soft">{content.subheadline}</p>
            <div className="mt-4 h-[174px] flex justify-center overflow-hidden">
              <div className="origin-top scale-[0.48]">
                <BookCover
                  title={content.bookTitle}
                  author={content.author}
                  eyebrow={content.coverEyebrow}
                  edition={content.coverEdition}
                />
              </div>
            </div>
            <div className="relative mt-5 rounded-[14px] border border-blush-deep bg-surface px-4 pb-4 pt-6">
              <div className="absolute -top-3 left-4 rounded-full bg-badge text-badge-text px-3 py-1 text-[9px] uppercase font-medium">
                {content.formBadge}
              </div>
              <div className="text-xs font-medium text-ink">{content.formHeading}</div>
              <div className="mt-3 flex gap-2">
                <div className="h-10 flex-1 rounded-[10px] border border-blush-deep bg-input px-3 flex items-center text-xs text-mute">
                  {content.formPlaceholder}
                </div>
                <div className="h-10 rounded-[10px] bg-button text-button-text px-3 flex items-center text-xs font-medium">
                  {content.buttonText}
                </div>
              </div>
            </div>
            <div
              className="mt-4 flex items-center gap-2 rounded-[12px] border px-3 py-2.5 text-xs"
              style={{
                background: draft.toastBackground,
                borderColor: draft.toastBorder,
                color: draft.toastText,
              }}
            >
              <span className="font-semibold">✓</span>
              You&apos;re on the list. Check your inbox.
            </div>
          </div>
        </div>
        <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
      </aside>
    </div>
  );
}

const EMAIL_COLORS: Array<{ key: keyof EmailTemplate; label: string }> = [
  { key: "background", label: "Email background" },
  { key: "surface", label: "Message card" },
  { key: "headerBackground", label: "Header" },
  { key: "border", label: "Borders" },
  { key: "accent", label: "Accent" },
  { key: "headingText", label: "Heading text" },
  { key: "bodyText", label: "Body text" },
  { key: "mutedText", label: "Footer text" },
];

function EmailTemplateTab({
  draft,
  setDraft,
  content,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  draft: EmailTemplate;
  setDraft: (template: EmailTemplate) => void;
  content: SiteContent;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  function set<K extends keyof EmailTemplate>(key: K, value: EmailTemplate[K]) {
    setDraft({ ...draft, [key]: value });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_440px] gap-6">
      <div className="space-y-6">
        <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
          <SectionTitle title="Welcome email" desc="Sent after a reader joins the primary waitlist." />
          <Field label="Subject" value={draft.subject} onChange={(v) => set("subject", v)} />
          <Field label="Eyebrow" value={draft.eyebrow} onChange={(v) => set("eyebrow", v)} />
          <Field label="Heading" value={draft.heading} onChange={(v) => set("heading", v)} />
          <Field label="Subtitle" value={draft.subtitle} onChange={(v) => set("subtitle", v)} />
          <Field label="Opening" value={draft.intro} onChange={(v) => set("intro", v)} multiline />
          <Field label="Message" value={draft.message} onChange={(v) => set("message", v)} multiline rows={4} />
          <Field label="Signoff" value={draft.signoff} onChange={(v) => set("signoff", v)} multiline />
          <Field label="Footer note" value={draft.footer} onChange={(v) => set("footer", v)} multiline />
          <p className="text-xs text-mute">
            Dynamic fields: {"{{firstName}}"}, {"{{bookTitle}}"}, {"{{subheadline}}"}, {"{{footerText}}"}
          </p>
        </div>
        <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
          <SectionTitle title="Email colors" />
          <div className="grid sm:grid-cols-2 gap-3">
            {EMAIL_COLORS.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={draft[key]}
                onChange={(value) => setDraft({ ...draft, [key]: value })}
              />
            ))}
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 self-start">
        <div
          className="rounded-[18px] border border-blush-deep/60 p-4 sm:p-5"
          style={{ background: draft.background }}
        >
          <div className="text-[11px] text-mute mb-3 truncate">
            Subject: {fillTemplate(draft.subject, content)}
          </div>
          <div
            className="rounded-[14px] overflow-hidden border"
            style={{ background: draft.surface, borderColor: draft.border }}
          >
            <div
              className="px-5 py-5 border-b"
              style={{ background: draft.headerBackground, borderColor: draft.border }}
            >
              <div className="text-[10px] font-semibold uppercase" style={{ color: draft.accent }}>
                {fillTemplate(draft.eyebrow, content)}
              </div>
              <h3
                className="mt-2 font-serif text-2xl leading-tight"
                style={{ color: draft.headingText, fontFamily: "var(--font-serif)" }}
              >
                {fillTemplate(draft.heading, content)}
              </h3>
              <p className="mt-1 text-xs" style={{ color: draft.mutedText }}>
                {fillTemplate(draft.subtitle, content)}
              </p>
            </div>
            <div className="p-5 space-y-3 text-sm leading-relaxed" style={{ color: draft.bodyText }}>
              <p className="whitespace-pre-line">{fillTemplate(draft.intro, content)}</p>
              <p className="whitespace-pre-line">{fillTemplate(draft.message, content)}</p>
              <p className="whitespace-pre-line">{fillTemplate(draft.signoff, content)}</p>
              <div className="h-px" style={{ background: draft.border }} />
              <p className="text-xs whitespace-pre-line" style={{ color: draft.mutedText }}>
                {fillTemplate(draft.footer, content)}
              </p>
            </div>
          </div>
          <p
            className="mt-3 text-center font-serif italic text-xs"
            style={{ color: draft.mutedText, fontFamily: "var(--font-serif)" }}
          >
            {content.footerText}
          </p>
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
  removingSubscriber,
}: {
  subscribers: Subscriber[];
  onRefresh: () => void;
  onRemove: (email: string) => void;
  removingSubscriber: string | null;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      q
        ? subscribers.filter((s) =>
            `${s.name ?? ""} ${s.email}`.toLowerCase().includes(q.toLowerCase()),
          )
        : subscribers,
    [q, subscribers],
  );

  return (
    <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <SectionTitle title="Waitlist subscribers" desc={`${subscribers.length} total`} className="m-0" />
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/subscribers?format=csv"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-surface text-sm text-ink-soft hover:border-rose/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </a>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-surface text-sm text-ink-soft hover:border-rose/50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or email..."
        className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-input px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors mb-5"
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
                <th className="font-medium px-4 py-2.5 hidden md:table-cell">Name</th>
                <th className="font-medium px-4 py-2.5 hidden sm:table-cell">Joined</th>
                <th className="font-medium px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.email} className="border-t border-blush-deep/40">
                  <td className="px-4 py-3 text-ink truncate">{s.email}</td>
                  <td className="px-4 py-3 text-mute hidden md:table-cell truncate">
                    {s.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-mute hidden sm:table-cell">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RemoveButton
                      removing={removingSubscriber === `main:${s.email}`}
                      onRemove={() => onRemove(s.email)}
                    />
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

function UpcomingTab({
  draft,
  content,
  setDraft,
  uploading,
  fileRef,
  onPickFile,
  onCoverChange,
  onClearCover,
  dirty,
  saving,
  onSave,
  onReset,
  upcomingSubscribers,
  onRefreshUpcoming,
  onRemoveUpcoming,
  removingSubscriber,
}: {
  draft: SiteContent;
  content: SiteContent;
  setDraft: (c: SiteContent) => void;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onPickFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (url: string) => void;
  onClearCover: () => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  upcomingSubscribers: Subscriber[];
  onRefreshUpcoming: () => void;
  onRemoveUpcoming: (email: string) => void;
  removingSubscriber: string | null;
}) {
  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft({ ...draft, [key]: value });
  }

  const visibilityChanged = draft.upcomingEnabled !== content.upcomingEnabled;
  const [subscriberQuery, setSubscriberQuery] = useState("");
  const filteredUpcomingSubscribers = useMemo(
    () =>
      subscriberQuery
        ? upcomingSubscribers.filter((subscriber) =>
            `${subscriber.name ?? ""} ${subscriber.email}`
              .toLowerCase()
              .includes(subscriberQuery.toLowerCase()),
          )
        : upcomingSubscribers,
    [subscriberQuery, upcomingSubscribers],
  );
  const emailContent: SiteContent = {
    ...draft,
    bookTitle: draft.upcomingTitle || "Upcoming book",
    subheadline: draft.upcomingSubheadline,
  };
  const upcomingEmail = draft.upcomingEmailTemplate;

  function setUpcomingEmail<K extends keyof EmailTemplate>(key: K, value: EmailTemplate[K]) {
    set("upcomingEmailTemplate", { ...upcomingEmail, [key]: value });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      <div className="space-y-6">
        <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
          <div className="mb-5">
            <h2
              className="font-serif text-xl text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Upcoming book
            </h2>
            <p className="text-xs text-mute mt-1">
              Show a secondary book section with its own waitlist on the public site.
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-[14px] border border-blush-deep/60 bg-blush/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                Visibility
                {visibilityChanged && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase text-rose-deep">
                    Unsaved
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-mute">
                {draft.upcomingEnabled
                  ? "Visible on the public site after saving."
                  : "Hidden from the public site after saving."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.upcomingEnabled}
              aria-label="Show upcoming book on the public site"
              onClick={() => set("upcomingEnabled", !draft.upcomingEnabled)}
              className={`focus-rose inline-flex h-12 w-full shrink-0 items-center justify-between gap-3 rounded-[12px] border px-3 text-sm font-medium transition-colors sm:w-[136px] ${
                draft.upcomingEnabled
                  ? "border-rose-deep bg-surface text-rose-deep"
                  : "border-blush-deep bg-surface text-mute"
              }`}
            >
              <span>{draft.upcomingEnabled ? "Visible" : "Hidden"}</span>
              <span
                aria-hidden
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  draft.upcomingEnabled ? "bg-button" : "bg-blush-deep"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-surface shadow transition-transform ${
                    draft.upcomingEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </button>
          </div>

          <Field label="Eyebrow" value={draft.upcomingEyebrow} onChange={(v) => set("upcomingEyebrow", v)} />
          <Field label="Book title" value={draft.upcomingTitle} onChange={(v) => set("upcomingTitle", v)} />
          <Field label="Author / Byline" value={draft.upcomingAuthor} onChange={(v) => set("upcomingAuthor", v)} />
          <Field label="Release date (free text)" value={draft.upcomingReleaseDate} onChange={(v) => set("upcomingReleaseDate", v)} />
          <Field
            label="Subheadline"
            value={draft.upcomingSubheadline}
            onChange={(v) => set("upcomingSubheadline", v)}
            multiline
          />
          <Field
            label="Body"
            value={draft.upcomingBody}
            onChange={(v) => set("upcomingBody", v)}
            multiline
            rows={8}
            help="Use blank lines to separate paragraphs."
          />

          <SectionTitle title="Upcoming waitlist form" className="mt-8" />
          <Field
            label="Badge"
            value={draft.upcomingFormBadge}
            onChange={(v) => set("upcomingFormBadge", v)}
          />
          <Field
            label="Name field label"
            value={draft.upcomingFormNameLabel}
            onChange={(v) => set("upcomingFormNameLabel", v)}
          />
          <Field
            label="Name placeholder"
            value={draft.upcomingFormNamePlaceholder}
            onChange={(v) => set("upcomingFormNamePlaceholder", v)}
            help="Keep this soft. The public field is optional to reduce friction."
          />
          <Field
            label="Email field label"
            value={draft.upcomingFormEmailLabel}
            onChange={(v) => set("upcomingFormEmailLabel", v)}
          />
          <Field
            label="Form heading"
            value={draft.upcomingFormHeading}
            onChange={(v) => set("upcomingFormHeading", v)}
          />
          <Field
            label="Microcopy"
            value={draft.upcomingFormMicrocopy}
            onChange={(v) => set("upcomingFormMicrocopy", v)}
          />
          <Field
            label="Button text"
            value={draft.upcomingButtonText}
            onChange={(v) => set("upcomingButtonText", v)}
          />
          <Field
            label="Email placeholder"
            value={draft.upcomingFormPlaceholder}
            onChange={(v) => set("upcomingFormPlaceholder", v)}
          />
          <Field
            label="Submitting button text"
            value={draft.upcomingFormLoadingText}
            onChange={(v) => set("upcomingFormLoadingText", v)}
          />
          <Field
            label="Submitted button text"
            value={draft.upcomingFormSubmittedText}
            onChange={(v) => set("upcomingFormSubmittedText", v)}
          />
          <Field
            label="Privacy note"
            value={draft.upcomingPrivacyNote}
            onChange={(v) => set("upcomingPrivacyNote", v)}
          />
          <SectionTitle title="Upcoming waitlist responses" className="mt-8" />
          <Field
            label="Invalid email message"
            value={draft.upcomingFormInvalidEmailMessage}
            onChange={(v) => set("upcomingFormInvalidEmailMessage", v)}
          />
          <Field
            label="Network error message"
            value={draft.upcomingFormNetworkErrorMessage}
            onChange={(v) => set("upcomingFormNetworkErrorMessage", v)}
          />
          <Field
            label="General error message"
            value={draft.upcomingFormGenericErrorMessage}
            onChange={(v) => set("upcomingFormGenericErrorMessage", v)}
          />
          <Field
            label="Successful signup message"
            value={draft.upcomingFormSuccessMessage}
            onChange={(v) => set("upcomingFormSuccessMessage", v)}
          />
          <Field
            label="Already subscribed message"
            value={draft.upcomingFormExistingMessage}
            onChange={(v) => set("upcomingFormExistingMessage", v)}
          />
        </div>

        <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
          <SectionTitle
            title="Upcoming cover image"
            desc="Upload a JPG, PNG, WebP, GIF, or AVIF (max 8 MB)."
          />
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field
              label="Fallback cover eyebrow"
              value={draft.upcomingCoverEyebrow}
              onChange={(v) => set("upcomingCoverEyebrow", v)}
            />
            <Field
              label="Fallback cover edition"
              value={draft.upcomingCoverEdition}
              onChange={(v) => set("upcomingCoverEdition", v)}
            />
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer rounded-[14px] border-2 border-dashed border-blush-deep bg-blush/30 hover:bg-blush/50 transition-colors p-8 text-center"
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-surface border border-blush-deep flex items-center justify-center text-rose-deep">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
            </div>
            <div className="mt-3 text-sm font-medium text-ink">
              {uploading ? "Uploading…" : "Click to upload the upcoming cover"}
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
              value={draft.upcomingCoverImage}
              onChange={(e) => onCoverChange(e.target.value)}
              placeholder="https://…"
              className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-input px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors"
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-mute">Either upload, or point to an externally-hosted image.</p>
              {draft.upcomingCoverImage && (
                <button
                  type="button"
                  onClick={onClearCover}
                  className="text-xs text-rose-deep hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
          <SectionTitle
            title="Upcoming signup email"
            desc="Sent only to readers who join this upcoming-book waitlist."
          />
          <Field label="Subject" value={upcomingEmail.subject} onChange={(v) => setUpcomingEmail("subject", v)} />
          <Field label="Eyebrow" value={upcomingEmail.eyebrow} onChange={(v) => setUpcomingEmail("eyebrow", v)} />
          <Field label="Heading" value={upcomingEmail.heading} onChange={(v) => setUpcomingEmail("heading", v)} />
          <Field label="Subtitle" value={upcomingEmail.subtitle} onChange={(v) => setUpcomingEmail("subtitle", v)} />
          <Field label="Opening" value={upcomingEmail.intro} onChange={(v) => setUpcomingEmail("intro", v)} multiline />
          <Field label="Message" value={upcomingEmail.message} onChange={(v) => setUpcomingEmail("message", v)} multiline rows={4} />
          <Field label="Signoff" value={upcomingEmail.signoff} onChange={(v) => setUpcomingEmail("signoff", v)} multiline />
          <Field label="Footer note" value={upcomingEmail.footer} onChange={(v) => setUpcomingEmail("footer", v)} multiline />
          <p className="mb-6 text-xs text-mute">
            Dynamic fields: {"{{firstName}}"}, {"{{bookTitle}}"}, {"{{subheadline}}"}, {"{{footerText}}"}
          </p>
          <SectionTitle title="Upcoming email colors" />
          <div className="grid sm:grid-cols-2 gap-3">
            {EMAIL_COLORS.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={upcomingEmail[key]}
                onChange={(value) => setUpcomingEmail(key, value)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-blush-deep/60 bg-surface p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <SectionTitle
              title="Upcoming-list subscribers"
              desc={`${upcomingSubscribers.length} total`}
              className="m-0"
            />
            <div className="flex items-center gap-2">
              <a
                href="/api/admin/subscribers?list=upcoming&format=csv"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-surface text-sm text-ink-soft hover:border-rose/50 transition-colors"
              >
                Export CSV
              </a>
              <button
                onClick={onRefreshUpcoming}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-blush-deep bg-surface text-sm text-ink-soft hover:border-rose/50 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          <input
            value={subscriberQuery}
            onChange={(e) => setSubscriberQuery(e.target.value)}
            placeholder="Search upcoming subscribers by name or email"
            className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-input px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors mb-5"
          />

          {filteredUpcomingSubscribers.length === 0 ? (
            <p className="py-10 text-center text-mute text-sm">
              {upcomingSubscribers.length === 0 ? "No upcoming-list subscribers yet." : "No matches."}
            </p>
          ) : (
            <div className="overflow-hidden rounded-[12px] border border-blush-deep/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blush/40 text-ink-soft text-left">
                    <th className="font-medium px-4 py-2.5">Email</th>
                    <th className="font-medium px-4 py-2.5 hidden md:table-cell">Name</th>
                    <th className="font-medium px-4 py-2.5 hidden sm:table-cell">Joined</th>
                    <th className="font-medium px-4 py-2.5 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {filteredUpcomingSubscribers.map((s) => (
                    <tr key={s.email} className="border-t border-blush-deep/40">
                      <td className="px-4 py-3 text-ink truncate">{s.email}</td>
                      <td className="px-4 py-3 text-mute hidden md:table-cell truncate">
                        {s.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-mute hidden sm:table-cell">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RemoveButton
                          removing={removingSubscriber === `upcoming:${s.email}`}
                          onRemove={() => onRemoveUpcoming(s.email)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 self-start space-y-5">
        <div className="rounded-[18px] border border-blush-deep/60 bg-gradient-to-br from-blush/50 to-surface p-6">
          <div className="text-[11px] tracking-[0.24em] uppercase text-rose-deep mb-5 text-center">
            Live preview
          </div>
          <div className="flex justify-center py-2">
            <BookCover
              title={draft.upcomingTitle}
              author={draft.upcomingAuthor}
              eyebrow={draft.upcomingCoverEyebrow}
              edition={draft.upcomingCoverEdition}
              image={draft.upcomingCoverImage}
            />
          </div>
          <div className="mt-5 rounded-[14px] bg-surface p-4 border border-blush-deep/50">
            <div className="text-[10px] tracking-[0.28em] uppercase text-rose-deep">
              {draft.upcomingEyebrow || "Coming soon"}
            </div>
            <h3
              className="mt-2 font-serif text-xl leading-tight text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {draft.upcomingTitle || "Untitled"}
            </h3>
            {draft.upcomingSubheadline && (
              <p
                className="mt-1 font-serif italic text-mute text-sm"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {draft.upcomingSubheadline}
              </p>
            )}
            <p className="mt-2 text-[12.5px] text-ink-soft line-clamp-5 whitespace-pre-line">
              {draft.upcomingBody}
            </p>
          </div>
          {!draft.upcomingEnabled && (
            <p className="mt-4 text-center text-xs text-mute">
              Section is hidden on the public site. Toggle above to publish.
            </p>
          )}
          {content.upcomingCoverImage !== draft.upcomingCoverImage && (
            <p className="mt-3 text-center text-xs text-rose-deep">
              Unsaved cover change — click Save to publish.
            </p>
          )}
        </div>
        <div
          className="rounded-[18px] border border-blush-deep/60 p-4 sm:p-5"
          style={{ background: upcomingEmail.background }}
        >
          <div className="text-[11px] text-mute mb-3 truncate">
            Subject: {fillTemplate(upcomingEmail.subject, emailContent)}
          </div>
          <div
            className="rounded-[14px] overflow-hidden border"
            style={{ background: upcomingEmail.surface, borderColor: upcomingEmail.border }}
          >
            <div
              className="px-5 py-5 border-b"
              style={{ background: upcomingEmail.headerBackground, borderColor: upcomingEmail.border }}
            >
              <div className="text-[10px] font-semibold uppercase" style={{ color: upcomingEmail.accent }}>
                {fillTemplate(upcomingEmail.eyebrow, emailContent)}
              </div>
              <h3
                className="mt-2 font-serif text-2xl leading-tight"
                style={{ color: upcomingEmail.headingText, fontFamily: "var(--font-serif)" }}
              >
                {fillTemplate(upcomingEmail.heading, emailContent)}
              </h3>
              <p className="mt-1 text-xs" style={{ color: upcomingEmail.mutedText }}>
                {fillTemplate(upcomingEmail.subtitle, emailContent)}
              </p>
            </div>
            <div className="p-5 space-y-3 text-sm leading-relaxed" style={{ color: upcomingEmail.bodyText }}>
              <p className="whitespace-pre-line">{fillTemplate(upcomingEmail.intro, emailContent)}</p>
              <p className="whitespace-pre-line">{fillTemplate(upcomingEmail.message, emailContent)}</p>
              <p className="whitespace-pre-line">{fillTemplate(upcomingEmail.signoff, emailContent)}</p>
              <div className="h-px" style={{ background: upcomingEmail.border }} />
              <p className="text-xs whitespace-pre-line" style={{ color: upcomingEmail.mutedText }}>
                {fillTemplate(upcomingEmail.footer, emailContent)}
              </p>
            </div>
          </div>
          <p
            className="mt-3 text-center font-serif italic text-xs"
            style={{ color: upcomingEmail.mutedText, fontFamily: "var(--font-serif)" }}
          >
            {draft.footerText}
          </p>
        </div>
        <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
      </aside>
    </div>
  );
}

/* ------------------- bits ------------------- */

function RemoveButton({
  removing,
  onRemove,
}: {
  removing: boolean;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <button
      type="button"
      disabled={removing}
      onBlur={() => {
        if (!removing) setConfirming(false);
      }}
      onClick={() => {
        if (confirming) {
          onRemove();
        } else {
          setConfirming(true);
        }
      }}
      className={`text-xs hover:underline disabled:cursor-wait disabled:opacity-60 ${
        confirming ? "font-medium text-wine" : "text-rose-deep"
      }`}
    >
      {removing ? "Removing..." : confirming ? "Confirm" : "Remove"}
    </button>
  );
}

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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 h-12 px-3 rounded-[10px] border border-blush-deep bg-input">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink-soft truncate">{label}</span>
        <span className="block text-[11px] text-mute uppercase">{value}</span>
      </span>
    </label>
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
          className="focus-rose w-full rounded-[10px] border border-blush-deep bg-input px-3.5 py-2.5 text-[15px] text-ink hover:border-rose/50 transition-colors leading-relaxed resize-y"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-input px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors"
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
    <div className="mt-5 flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border border-blush-deep/60 bg-surface/85 backdrop-blur-md">
      <span className="text-xs text-mute">
        {dirty ? "You have unsaved changes." : "All changes saved."}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onReset}
          disabled={!dirty || saving}
          className="h-9 px-3 rounded-[10px] border border-blush-deep bg-surface text-sm text-ink-soft hover:border-rose/50 transition-colors disabled:opacity-50"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="shadow-action h-9 px-4 rounded-[10px] bg-button text-button-text text-sm font-medium hover:bg-button-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
