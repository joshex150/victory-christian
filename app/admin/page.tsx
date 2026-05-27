import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getServerSession();
  if (session) redirect("/admin/dashboard");

  return (
    <main className="relative min-h-screen bg-cream paper-grain overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="orb orb-a -top-32 -left-24 h-[420px] w-[420px] bg-blush" />
        <div className="orb orb-b -bottom-40 -right-24 h-[520px] w-[520px] bg-blush-deep" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blush-deep bg-blush/60 text-rose-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-deep" />
              <span className="text-[11px] tracking-[0.28em] uppercase font-medium">Admin</span>
            </div>
            <h1
              className="mt-4 font-serif text-4xl text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Welcome back.
            </h1>
            <p className="mt-2 text-mute text-sm">Sign in to manage your launch.</p>
          </div>

          <div className="shadow-panel rounded-[20px] border border-blush-deep/60 bg-surface/85 backdrop-blur-md p-7 sm:p-8">
            <LoginForm />
          </div>

          <p className="text-center text-mute text-xs mt-6">
            Forgot your password? Update <code className="text-rose-deep">ADMIN_PASSWORD</code> in your <code className="text-rose-deep">.env.local</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
