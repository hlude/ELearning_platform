"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  function handleBack() {
    router.back();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-[#0F1B33] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-[family-name:var(--font-display)] font-bold text-xs shrink-0">
              E
            </span>
            <span className="text-base font-[family-name:var(--font-display)] font-semibold text-white whitespace-nowrap">
              eLearning Platform
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-white/70 shrink-0">
          <Link href="/courses" className="hover:text-white transition-colors whitespace-nowrap">
            Courses
          </Link>
          <Link href="/dashboard" className="hover:text-white transition-colors whitespace-nowrap">
            My Courses
          </Link>
          <Link href="/instructor/analytics" className="hover:text-white transition-colors whitespace-nowrap">
            Analytics
          </Link>
          <Link href="/login" className="hover:text-white transition-colors whitespace-nowrap">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-500 transition-colors font-semibold whitespace-nowrap"
          >
            Sign up
          </Link>
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-red-400 transition-colors font-medium whitespace-nowrap"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}