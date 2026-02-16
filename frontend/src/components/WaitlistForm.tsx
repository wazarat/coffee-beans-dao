"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
      setEmail("");
      setNotes("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-400">
          You&apos;re on the list!
        </p>
        <p className="text-sm text-stone-400 mt-1">
          We&apos;ll notify you when the Coffee Beans DAO goes live.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-stone-500 hover:text-stone-300 transition-colors underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-stone-800 bg-stone-900 p-6 space-y-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-stone-100">
          Get Notified When We Go Live
        </h3>
        <p className="text-sm text-stone-500 mt-1">
          Join the waitlist for the Coffee Beans DAO. Enter your email and tell
          us why you want to be part of the collective.
        </p>
      </div>

      <div>
        <label
          htmlFor="waitlist-email"
          className="text-sm font-medium text-stone-300 mb-1 block"
        >
          Email
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
        />
      </div>

      <div>
        <label
          htmlFor="waitlist-notes"
          className="text-sm font-medium text-stone-300 mb-1 block"
        >
          Why do you want to join the DAO?
        </label>
        <textarea
          id="waitlist-notes"
          rows={3}
          placeholder="e.g. I run a small coffee shop and want to access better MOQ pricing..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600 resize-none"
        />
      </div>

      {status === "error" && (
        <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white font-medium py-2.5 rounded-md transition-colors"
      >
        {status === "loading" ? "Submitting..." : "Join the Waitlist"}
      </button>
    </form>
  );
}
