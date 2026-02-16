"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-amber-500 hover:text-amber-400 transition-colors"
        >
          <span className="text-2xl">&#9749;</span>
          Coffee Beans DAO
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-stone-400 hover:text-stone-100 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/proposals/new"
            className="text-sm bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            New Proposal
          </Link>
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </nav>
      </div>
    </header>
  );
}
