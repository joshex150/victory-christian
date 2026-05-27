import BookCover from "./BookCover";
import WaitlistForm from "./WaitlistForm";
import type { SiteContent } from "@/lib/storage";

export default function UpcomingSection({ content }: { content: SiteContent }) {
  const paragraphs = content.upcomingBody
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasDetails = Boolean(
    content.upcomingTitle.trim() ||
      content.upcomingAuthor.trim() ||
      content.upcomingSubheadline.trim() ||
      content.upcomingReleaseDate.trim() ||
      paragraphs.length,
  );

  return (
    <section
      aria-labelledby="upcoming-heading"
      className="relative mt-24 sm:mt-28 pt-14 sm:pt-16 border-t border-blush-deep/40"
    >
      <div className="grid gap-12 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16 xl:gap-20 items-center">
        <div className="reveal flex justify-center lg:justify-start">
          <BookCover
            title={content.upcomingTitle}
            author={content.upcomingAuthor}
            eyebrow={content.upcomingCoverEyebrow}
            edition={content.upcomingCoverEdition}
            image={content.upcomingCoverImage}
          />
        </div>

        <div className="reveal min-w-0 max-w-[760px]">
          <div className="flex justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blush-deep bg-blush/60 text-rose-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-deep" />
              <span id="upcoming-heading" className="text-[11px] tracking-[0.28em] uppercase font-medium">
                {content.upcomingEyebrow}
              </span>
            </div>
          </div>

          {hasDetails && (
            <div className="mt-6">
              {content.upcomingTitle && (
                <h2
                  className="font-serif text-ink text-[34px] leading-[1.08] sm:text-[44px] md:text-[50px]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {content.upcomingTitle}
                </h2>
              )}

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

              {(content.upcomingAuthor || content.upcomingReleaseDate) && (
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
                    <span className="text-mute text-sm">{content.upcomingReleaseDate}</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={`${hasDetails ? "mt-9" : "mt-8 lg:mt-6"} [&>section]:mt-0`}>
            <WaitlistForm
              heading={content.upcomingFormHeading}
              microcopy={content.upcomingFormMicrocopy}
              buttonText={content.upcomingButtonText}
              privacyNote={content.upcomingPrivacyNote}
              badge={content.upcomingFormBadge}
              nameLabel={content.upcomingFormNameLabel}
              namePlaceholder={content.upcomingFormNamePlaceholder}
              emailLabel={content.upcomingFormEmailLabel}
              placeholder={content.upcomingFormPlaceholder}
              loadingText={content.upcomingFormLoadingText}
              submittedText={content.upcomingFormSubmittedText}
              invalidEmailMessage={content.upcomingFormInvalidEmailMessage}
              networkErrorMessage={content.upcomingFormNetworkErrorMessage}
              genericErrorMessage={content.upcomingFormGenericErrorMessage}
              list="upcoming"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
