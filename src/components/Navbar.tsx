"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const linkStyle = (path: string) =>
    `transition font-medium ${
      pathname === path
        ? "text-pink-600 border-b-2 border-pink-500"
        : "text-gray-700 hover:text-pink-600"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/40 border-b border-pink-200/40 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <h1 className="text-2xl font-extrabold text-pink-600 tracking-wide">
          <Link href="/">PRISM</Link>
        </h1>

        {/* Nav Links */}
        <div className="hidden sm:flex gap-6">
          <Link href="/" className={linkStyle("/")}>
            Home
          </Link>
          <Link href="/interview" className={linkStyle("/interview")}>
            Interview
          </Link>
          {session && (
            <Link href="/dashboard" className={linkStyle("/dashboard")}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-3">
          {session ? (
            <>
              <span className="text-gray-700 font-medium">
                Welcome, {session.user?.name || "User"}
              </span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-4 py-2 text-sm rounded-lg bg-white/70 border border-pink-300 text-pink-600 font-semibold hover:bg-pink-100 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-md hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
