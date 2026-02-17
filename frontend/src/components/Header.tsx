"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/beans">Beans</NavLink>
          <NavLink href="/proposals/new">New Proposal</NavLink>

          {status === "authenticated" && (
            <NavLink href="/profile">Profile</NavLink>
          )}

          <div className="flex items-center gap-2 ml-2">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="avatar"
            />

            {status === "authenticated" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 max-w-[120px] truncate">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : status === "unauthenticated" ? (
              <Link
                href="/login"
                className="text-sm bg-stone-700 hover:bg-stone-600 text-stone-200 px-3 py-1.5 rounded-md transition-colors"
              >
                Sign In
              </Link>
            ) : null}
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-stone-400 hover:text-stone-100"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 px-4 py-3 space-y-3 bg-stone-900">
          <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
            Dashboard
          </MobileNavLink>
          <MobileNavLink
            href="/beans"
            onClick={() => setMobileMenuOpen(false)}
          >
            Beans
          </MobileNavLink>
          <MobileNavLink
            href="/proposals/new"
            onClick={() => setMobileMenuOpen(false)}
          >
            New Proposal
          </MobileNavLink>
          {status === "authenticated" && (
            <MobileNavLink
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </MobileNavLink>
          )}

          <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center gap-2">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="avatar"
            />
            {status === "authenticated" ? (
              <button
                onClick={() => signOut()}
                className="text-sm text-stone-500 hover:text-stone-300"
              >
                Logout
              </button>
            ) : status === "unauthenticated" ? (
              <Link
                href="/login"
                className="text-sm bg-stone-700 hover:bg-stone-600 text-stone-200 px-3 py-1.5 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-stone-400 hover:text-stone-100 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block text-sm text-stone-400 hover:text-stone-100 transition-colors py-1"
    >
      {children}
    </Link>
  );
}
