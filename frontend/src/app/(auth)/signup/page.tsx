"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-stone-400 mt-2">
            Join Coffee Beans DAO to participate in collective bean orders
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-stone-800 bg-stone-900 p-6"
        >
          {error && (
            <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-stone-300 mb-1 block">
              Name
            </span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
              placeholder="Your name (optional)"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-300 mb-1 block">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-300 mb-1 block">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-300 mb-1 block">
              Confirm Password
            </span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
              placeholder="Confirm your password"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white font-medium py-2.5 rounded-md transition-colors"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-amber-500 hover:text-amber-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
