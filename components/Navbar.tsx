"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[#FBF7EF] border-b-2 border-[#14213D]/10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-[#14213D] flex items-center justify-center text-[#F2B705] font-[family-name:var(--font-display)] font-bold text-sm">
            E
          </span>
          <span className="text-xl font-[family-name:var(--font-display)] font-semibold text-[#14213D]">
            EduPlatform
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-[#14213D]/70">
          <Link href="/courses" className="hover:text-[#14213D] transition-colors">
            Courses
          </Link>
          <Link href="/dashboard" className="hover:text-[#14213D] transition-colors">
            My Courses
          </Link>
          <Link href="/instructor/analytics" className="hover:text-[#14213D] transition-colors">
            Analytics
          </Link>
          <Link href="/login" className="hover:text-[#14213D] transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-[#14213D] text-[#FBF7EF] px-4 py-2 rounded-full hover:bg-[#1f2f57] transition-colors font-semibold"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
