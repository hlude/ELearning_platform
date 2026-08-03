"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-blue-200 bg-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-950">
          EduPlatform
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-blue-700">
          <Link href="/courses" className="hover:text-blue-950 transition-colors">
            Courses
          </Link>
          <Link href="/dashboard" className="hover:text-blue-950 transition-colors">
            My Courses
          </Link>
          <Link href="/instructor/analytics" className="hover:text-blue-950 transition-colors">
            Analytics
          </Link>
          <Link
            href="/login"
            className="text-blue-700 hover:text-blue-950 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}