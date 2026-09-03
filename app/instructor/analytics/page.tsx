"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CourseAnalytics = {
  id: string;
  title: string;
  slug: string;
  status: string;
  totalEnrollments: number;
  avgCompletion: number;
  avgQuizScore: number | null;
  totalQuizAttempts: number;
  avgRating: number | null;
  totalReviews: number;
};

export default function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/instructor/analytics");
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load analytics."); return; }
        setAnalytics(data.analytics);
      } catch (err) {
        setError("Something went wrong loading analytics.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading analytics...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;

  const totalStudents = analytics.reduce((sum, c) => sum + c.totalEnrollments, 0);
  const totalCourses = analytics.length;
  const avgRatingOverall =
    analytics.filter((c) => c.avgRating !== null).length > 0
      ? Math.round(
          (analytics.reduce((sum, c) => sum + (c.avgRating ?? 0), 0) /
            analytics.filter((c) => c.avgRating !== null).length) * 10
        ) / 10
      : null;
  const totalQuizAttempts = analytics.reduce((sum, c) => sum + c.totalQuizAttempts, 0);

  const maxEnrollments = Math.max(1, ...analytics.map((c) => c.totalEnrollments));

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="text-sm font-semibold text-[#2F6F62] uppercase tracking-wide mb-2">Instructor</p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[#14213D] mb-8">
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
          <p className="text-xs text-[#14213D]/50 mb-1">Total Students</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#14213D]">{totalStudents}</p>
        </div>
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
          <p className="text-xs text-[#14213D]/50 mb-1">Published Courses</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#14213D]">{totalCourses}</p>
        </div>
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
          <p className="text-xs text-[#14213D]/50 mb-1">Average Rating</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#14213D]">
            {avgRatingOverall !== null ? `${avgRatingOverall} ★` : "—"}
          </p>
        </div>
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
          <p className="text-xs text-[#14213D]/50 mb-1">Quiz Attempts</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#14213D]">{totalQuizAttempts}</p>
        </div>
      </div>

      {/* Simple bar chart: enrollments per course */}
      {analytics.length > 0 && (
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-[#14213D] mb-6">Enrollments by course</h2>
          <div className="flex items-end gap-4 h-48">
            {analytics.map((c) => (
              <div key={c.id} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-40">
                  <div
                    className="w-full bg-[#F2B705] rounded-t-lg transition-all"
                    style={{ height: `${(c.totalEnrollments / maxEnrollments) * 100}%`, minHeight: c.totalEnrollments > 0 ? 4 : 0 }}
                  />
                </div>
                <p className="text-xs text-[#14213D]/60 text-center line-clamp-1">{c.title}</p>
                <p className="text-xs font-semibold text-[#14213D]">{c.totalEnrollments}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course management table */}
      <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-[#14213D]/10">
          <h2 className="font-semibold text-[#14213D]">Course management</h2>
        </div>

        {analytics.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[#14213D]/60 mb-4">You haven't created any courses yet.</p>
            <Link
              href="/instructor/courses/new"
              className="inline-block bg-[#14213D] text-white rounded-full px-6 py-2.5 font-semibold hover:bg-[#1f2f57] transition-colors"
            >
              Create a Course
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#14213D]/5 text-[#14213D]/60 text-left">
              <tr>
                <th className="px-6 py-3">Course</th>
                <th className="px-6 py-3">Students</th>
                <th className="px-6 py-3">Completion</th>
                <th className="px-6 py-3">Quiz Score</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((c) => (
                <tr key={c.id} className="border-t border-[#14213D]/5">
                  <td className="px-6 py-3 font-medium text-[#14213D] max-w-xs truncate">{c.title}</td>
                  <td className="px-6 py-3 text-[#14213D]/70">{c.totalEnrollments}</td>
                  <td className="px-6 py-3 text-[#14213D]/70">{c.avgCompletion}%</td>
                  <td className="px-6 py-3 text-[#14213D]/70">
                    {c.avgQuizScore !== null ? `${c.avgQuizScore}%` : "—"}
                  </td>
                  <td className="px-6 py-3 text-[#14213D]/70">
                    {c.avgRating !== null ? `${c.avgRating} ★` : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs bg-[#F2B705]/20 text-[#14213D] px-2 py-0.5 rounded-full font-semibold">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/instructor/courses/${c.slug}/manage`}
                      className="text-sm text-[#2F6F62] font-semibold hover:underline"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}