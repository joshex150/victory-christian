import BookCover from "./BookCover";
import WaitlistForm from "./WaitlistForm";
import type { SiteContent } from "@/lib/storage";

export default function UpcomingSection({ content }: { content: SiteContent }) {
  const paragraphs = content.upcomingBody
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      aria-labelledby="upcoming-heading"
      className="relative mt-24 sm:mt-28 pt-14 sm:pt-16 border-t border-blush-deep/40"
    >
      <div className="reveal flex justify-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blush-deep bg-blush/60 text-rose-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-deep" />
          <span className="text-[11px] tracking-[0.28em] uppercase font-medium">
            {content.upcomingEyebrow || "Coming soon"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-12 lg:gap-16 items-center">
        {/* Cover (left on desktop, top on mobile via order) */}
        <div className="reveal flex justify-center lg:justify-start order-1">
          <BookCover
            title={content.upcomingTitle || "Upcoming title"}
            author={content.upcomingAuthor}
            image={content.upcomingCoverImage}
          />
        </div>

        <div className="reveal order-2">
          <h2
            id="upcoming-heading"
            className="font-serif text-ink text-[34px] leading-[1.05] sm:text-[44px] md:text-[52px] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {content.upcomingTitle || "An upcoming title"}
          </h2>

          {content.upcomingSubheadline && (
            <p
              className="mt-4 font-serif italic text-ink-soft text-lg sm:text-xl leading-snug"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {content.upcomingSubheadline}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div className="mt-5 space-y-4 text-[16px] sm:text-[17px] leading-[1.75] text-ink-soft max-w-[58ch]">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 text-mute">
            <span className="h-px w-10 bg-rose-deep/40" />
            {content.upcomingAuthor && (
              <span
                className="font-serif italic text-ink"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {content.upcomingAuthor}
              </span>
            )}
            {content.upcomingReleaseDate && (
              <span className="text-mute text-sm">— {content.upcomingReleaseDate}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto mt-12">
        <WaitlistForm
          heading={content.upcomingFormHeading}
          microcopy={content.upcomingFormMicrocopy}
          buttonText={content.upcomingButtonText}
          privacyNote="We respect your privacy. Unsubscribe at any time."
          list="upcoming"
          badge="Upcoming"
        />
      </div>
    </section>
  );
}
