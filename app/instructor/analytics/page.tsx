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

  if (loading) return <p className="text-center text-white/60 mt-24 bg-[#0F1B33] min-h-screen pt-24">Loading analytics...</p>;
  if (error) return <p className="text-center text-red-300 mt-24 bg-[#0F1B33] min-h-screen pt-24">{error}</p>;

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
    <div className="bg-[#008080] min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-sm font-semibold text-[[#1E293B]]-300 uppercase tracking-wide mb-2">Instructor</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-white mb-8">
          Dashboard
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#10B981] rounded-2xl p-5 shadow-sm">
            <p className="text-xs text--500 mb-1">Total Students</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text[#0F1B33]">{totalStudents}</p>
          </div>
          <div className="bg-[#10B981] rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-black-500 mb-1">Published Courses</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0F1B33]">{totalCourses}</p>
          </div>
          <div className="bg-[#10B981] rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-black-500 mb-1">Average Rating</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0F1B33]">
              {avgRatingOverall !== null ? `${avgRatingOverall} ★` : "—"}
            </p>
          </div>
          <div className="bg-[#10B981] rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-black-500 mb-1">Quiz Attempts</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0F1B33]">{totalQuizAttempts}</p>
          </div>
        </div>

        {/* Bar chart */}
        {analytics.length > 0 && (
          <div className="bg-[#D4D4D8] rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="font-semibold text-[#10B981] mb-6">Enrollments by course</h2>
            <div className="flex items-end gap-4 h-48">
              {analytics.map((c) => (
                <div key={c.id} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-40">
                    <div
                        className="w-full bg-blue-600 rounded-t-lg transition-all"
                      style={{ height: `${(c.totalEnrollments / maxEnrollments) * 100}%`, minHeight: c.totalEnrollments > 0 ? 4 : 0 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center line-clamp-1">{c.title}</p>
                  <p className="text-xs font-semibold text-[#050B14]">{c.totalEnrollments}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course management table */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#10B981]">Course management</h2>
          </div>

          {analytics.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
              <Link
                href="/instructor/courses/new"
                className="inline-block bg-[#[0F1B33]]-600 text-white rounded-full px-6 py-2.5 font-semibold hover:bg-[#0F1B33]-700 transition-colors"
              >
                Create a Course
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#94A3B8]-50 text-gray-500 text-left">
                <tr>
                  <th className="px-7 py-4">Course</th>
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
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="px-6 py-3 font-medium text-black max-w-xs truncate">{c.title}</td>
                    <td className="px-6 py-3 text-gray-600">{c.totalEnrollments}</td>
                    <td className="px-6 py-3 text-gray-600">{c.avgCompletion}%</td>
                    <td className="px-6 py-3 text-gray-600">
                      {c.avgQuizScore !== null ? `${c.avgQuizScore}%` : "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {c.avgRating !== null ? `${c.avgRating} ★` : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-[#[0F1B33]]-50 text-navy-700 px-2 py-0.5 rounded-full font-semibold">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/instructor/courses/${c.slug}/manage`}
                        className="text-sm text-navy-600 font-semibold hover:underline"
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
    </div>
  );
}