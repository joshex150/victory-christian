import LandingHero from "@/components/LandingHero";
import UpcomingSection from "@/components/UpcomingSection";
import WaitlistForm from "@/components/WaitlistForm";
import { getContent } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();

  return (
    <main className="paper-grain relative min-h-screen overflow-hidden bg-cream">
      {/* Ambient pink orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="orb orb-a -top-32 -left-24 h-[420px] w-[420px] bg-blush" />
        <div className="orb orb-b -bottom-40 -right-24 h-[520px] w-[520px] bg-blush-deep" />
        <div className="orb orb-a top-1/3 -right-40 h-[320px] w-[320px] bg-rose/20" />
      </div>

      {/* top hairline accent */}
      <div aria-hidden className="relative z-10 h-[3px] w-full bg-gradient-to-r from-transparent via-rose-deep/70 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1120px] px-5 sm:px-8 pt-14 sm:pt-20 lg:pt-24 pb-16">
        {/* Tiny brand mark */}
        <div className="reveal flex justify-center mb-12 sm:mb-16">
          <div className="flex items-center gap-3 text-mute">
            <span className="h-px w-10 bg-rose-deep/40" />
            <span
              className="font-serif italic text-ink tracking-wide"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {content.bookTitle}
            </span>
            <span className="h-px w-10 bg-rose-deep/40" />
          </div>
        </div>

        <LandingHero content={content} />

        <div className="max-w-[760px] mx-auto">
          <WaitlistForm
            heading={content.formHeading}
            microcopy={content.formMicrocopy}
            buttonText={content.buttonText}
            privacyNote={content.privacyNote}
          />
        </div>

        {content.upcomingEnabled && <UpcomingSection content={content} />}

        <footer className="mt-16 sm:mt-20 text-center">
          <p
            className="font-serif italic text-mute text-sm sm:text-[15px]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {content.footerText}
          </p>
          <p className="mt-3 text-[11px] tracking-[0.28em] uppercase text-mute/70">
            © {new Date().getFullYear()} {content.bookTitle}
          </p>
          <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-mute/80">
            <span>Built by </span>
            <a
              href="https://yeantech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-rose-deep
                         underline-draw decoration-rose-deep/40 hover:decoration-rose-deep
                         transition-colors focus-rose rounded-sm"
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-rose-deep"
              />
              Yean Technologies
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
