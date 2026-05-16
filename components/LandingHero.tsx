import BookCover from "./BookCover";
import type { SiteContent } from "@/lib/storage";

export default function LandingHero({ content }: { content: SiteContent }) {
  const paragraphs = content.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <header className="relative">
      <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
        {/* Text column */}
        <div className="relative">
          <div className="reveal reveal-delay-1 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blush-deep bg-blush/60 text-rose-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-deep" />
            <span className="text-[11px] tracking-[0.28em] uppercase font-medium">
              {content.eyebrow}
            </span>
          </div>

          <h1
            className="reveal reveal-delay-2 mt-5 font-serif text-ink
                       text-[40px] leading-[1.05]
                       sm:text-[54px] sm:leading-[1.02]
                       md:text-[64px] md:leading-[0.98]
                       lg:text-[68px]
                       tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-serif)",
              fontOpticalSizing: "auto",
              fontVariationSettings: "'opsz' 144, 'SOFT' 50",
            }}
          >
            You learned the{" "}
            <span className="relative inline-block italic text-rose-deep">
              hard way
              <svg
                aria-hidden
                viewBox="0 0 200 14"
                className="absolute left-0 -bottom-2 w-full h-3"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 C 40 2, 90 14, 198 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
            <br />
            Not anymore.
          </h1>

          <p
            className="reveal reveal-delay-3 mt-6 font-serif italic text-ink-soft text-xl sm:text-2xl leading-snug"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {content.subheadline}
          </p>

          <div className="reveal reveal-delay-4 mt-7 space-y-5 text-[16.5px] sm:text-[17.5px] leading-[1.75] text-ink-soft max-w-[58ch]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="reveal reveal-delay-5 mt-8 flex items-center gap-3 text-mute">
            <span className="h-px w-10 bg-rose-deep/40" />
            <span
              className="font-serif italic text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {content.bookTitle}
            </span>
            {content.author && (
              <span className="text-mute text-sm">— {content.author}</span>
            )}
          </div>
        </div>

        {/* Book cover column */}
        <div className="reveal reveal-delay-3 hidden lg:flex justify-center items-center pr-2">
          <BookCover
            title={content.bookTitle}
            author={content.author}
            image={content.coverImage}
          />
        </div>
      </div>

      {/* Mobile / tablet cover under text */}
      <div className="reveal reveal-delay-3 lg:hidden mt-12 flex justify-center">
        <BookCover
          title={content.bookTitle}
          author={content.author}
          image={content.coverImage}
        />
      </div>
    </header>
  );
}
