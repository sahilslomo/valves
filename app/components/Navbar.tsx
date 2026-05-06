"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-center z-50 bg-white/25 backdrop-blur-xl border-b border-white/20">

      <div className="w-full max-w-6xl flex justify-between items-center px-6 py-3">

        {/* ✅ ORIGINAL SHIP LOGO + NAVIK (RESTORED) */}
        <Link href="/" className="flex items-center gap-2 font-mono">

          <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
            <path d="M20 70C35 80 65 80 80 70" stroke="black" strokeWidth="2" />
            <path d="M50 20V70" stroke="black" strokeWidth="2" />
            <path d="M50 25L70 45L50 45Z" stroke="black" strokeWidth="2" fill="none" />
            <path d="M50 30L30 50L50 50Z" stroke="black" strokeWidth="2" fill="none" />
          </svg>

          <span className="text-lg font-bold tracking-wide">
            NAVIK
          </span>

        </Link>

        {/* AUTH BUTTONS */}
        <div className="font-mono">
          {status === "loading" ? (
            <p className="text-sm text-gray-400">...</p>
          ) : session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}