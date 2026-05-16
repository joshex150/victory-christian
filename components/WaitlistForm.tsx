"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

type Props = {
  heading: string;
  microcopy: string;
  buttonText: string;
  privacyNote: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm({
  heading,
  microcopy,
  buttonText,
  privacyNote,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Try again.");
        toast.error(data.message || "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
      setMessage(data.message);
      toast.success(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <section
      aria-labelledby="waitlist-heading"
      className="relative mt-14 sm:mt-16 rounded-[22px] border border-blush-deep/60 bg-white/80 backdrop-blur-md
                 shadow-[0_24px_80px_-32px_rgba(176,44,84,0.25)]
                 p-7 sm:p-9 md:p-10"
    >
      {/* decorative top tag */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose text-white text-[10px] tracking-[0.28em] uppercase font-medium shadow-[0_8px_20px_-6px_rgba(212,69,106,0.55)]">
        Waitlist
      </div>

      <h2
        id="waitlist-heading"
        className="font-serif text-2xl sm:text-3xl md:text-[34px] leading-[1.15] text-ink text-center"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {heading}
      </h2>
      <p className="mt-2 text-center text-mute text-sm sm:text-[15px]">{microcopy}</p>

      <form onSubmit={onSubmit} noValidate className="mt-7 sm:mt-8">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch">
          <div className="relative flex-1">
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-deep/60">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="you@yourname.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              disabled={isLoading || isSuccess}
              aria-invalid={status === "error"}
              aria-describedby="email-help"
              className="focus-rose w-full h-12 sm:h-[52px] rounded-[12px] border border-blush-deep
                         bg-white pl-11 pr-4 text-[15px] text-ink placeholder:text-mute/70
                         transition-colors duration-200
                         hover:border-rose/50 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="group relative h-12 sm:h-[52px] px-6 sm:px-7 rounded-[12px] font-medium text-[15px] text-white
                       bg-rose-deep hover:bg-wine active:translate-y-[1px]
                       transition-all duration-200
                       shadow-[0_10px_24px_-10px_rgba(176,44,84,0.7)]
                       focus-rose disabled:opacity-70 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner /> Sending…
              </>
            ) : isSuccess ? (
              <>
                <Check /> You're in
              </>
            ) : (
              <>
                <span>{buttonText}</span>
                <svg
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        <p
          id="email-help"
          aria-live="polite"
          className={`mt-3 text-center text-[13px] min-h-[20px] ${
            status === "error"
              ? "text-rose-deep"
              : status === "success"
                ? "text-wine"
                : "text-mute"
          }`}
        >
          {message ?? privacyNote}
        </p>
      </form>
    </section>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
