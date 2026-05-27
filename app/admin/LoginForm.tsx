"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data.success) {
        toast.error(data.message || "Unable to sign in.");
        setLoading(false);
        return;
      }
      toast.success("Signed in.");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-ink-soft mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-input px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-ink-soft mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-rose w-full h-11 rounded-[10px] border border-blush-deep bg-input px-3.5 text-[15px] text-ink hover:border-rose/50 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="shadow-action w-full h-11 rounded-[10px] bg-button hover:bg-button-hover text-button-text text-[15px] font-medium transition-colors disabled:opacity-70"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
