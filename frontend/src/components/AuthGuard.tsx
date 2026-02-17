"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-stone-400 mb-4">
          You need to be signed in to access this page.
        </p>
        <Link
          href="/login"
          className="inline-block bg-amber-700 hover:bg-amber-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
