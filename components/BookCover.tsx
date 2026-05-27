"use client";

type Props = {
  title: string;
  author: string;
  eyebrow: string;
  edition: string;
  image?: string;
};

export default function BookCover({ title, author, eyebrow, edition, image }: Props) {
  return (
    <div className="relative inline-block book-float [transform-style:preserve-3d]">
      {/* drop shadow underneath */}
      <div
        aria-hidden
        className="shadow-book-floor absolute -bottom-10 left-1/2 -translate-x-1/2 h-10 w-[78%] rounded-[50%] blur-2xl"
      />

      {/* page edges (right side stack) */}
      <div
        aria-hidden
        className="themed-book-pages absolute top-1.5 right-[-6px] bottom-1.5 w-[6px] rounded-r-[4px]
                   shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
      />

      <div
        className="shadow-book relative w-[230px] sm:w-[270px] md:w-[300px] aspect-[2/3] rounded-[6px] overflow-hidden
                   ring-1 ring-black/5"
      >
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/20" />
            {/* spine highlight */}
            <div className="absolute inset-y-0 left-0 w-[8px] bg-gradient-to-r from-black/25 to-transparent" />
            {/* gloss */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.08)_100%)]" />
          </>
        ) : (
          <>
            <div className="themed-book-cover absolute inset-0" />
            {/* spine highlight */}
            <div className="absolute inset-y-0 left-0 w-[10px] bg-gradient-to-r from-rose-deep/30 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] tracking-[0.32em] uppercase text-rose-deep font-medium">
                  {eyebrow}
                </div>
                <div className="mt-2 h-px w-10 bg-rose-deep/60" />
              </div>
              <div>
                <div
                  className="font-serif text-[26px] leading-[1.05] text-ink"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {title}
                </div>
                <div className="mt-3 font-serif italic text-mute text-sm">
                  {author}
                </div>
              </div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-mute">
                {edition}
              </div>
            </div>
            {/* gloss */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.25)_100%)] pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
}
