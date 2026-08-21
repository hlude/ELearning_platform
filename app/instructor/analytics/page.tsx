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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#14213D] mb-8">
        Instructor Analytics
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
          <p className="text-sm text-[#14213D]/50">Total Courses</p>
          <p className="text-2xl font-bold text-[#14213D]">{totalCourses}</p>
        </div>
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
          <p className="text-sm text-[#14213D]/50">Total Students</p>
          <p className="text-2xl font-bold text-[#14213D]">{totalStudents}</p>
        </div>
      </div>

      {analytics.length === 0 && (
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-8 text-center">
          <p className="text-[#14213D]/60 mb-4">You haven't created any courses yet.</p>
          <Link
            href="/instructor/courses/new"
            className="inline-block bg-[#14213D] text-white rounded-full px-6 py-2.5 font-semibold hover:bg-[#1f2f57] transition-colors"
          >
            Create a Course
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {analytics.map((course) => (
          <div key={course.id} className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#14213D]">
                  {course.title}
                </h2>
                <span className="text-xs bg-[#F2B705]/20 text-[#14213D] px-2 py-0.5 rounded-full font-semibold">
                  {course.status}
                </span>
              </div>
              <Link
                href={`/instructor/courses/${course.slug}/manage`}
                className="text-sm text-[#2F6F62] hover:underline font-semibold"
              >
                Manage →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#14213D]/50 mb-1">Students</p>
                <p className="text-xl font-bold text-[#14213D]">{course.totalEnrollments}</p>
              </div>
              <div>
                <p className="text-xs text-[#14213D]/50 mb-1">Avg. Completion</p>
                <p className="text-xl font-bold text-[#14213D]">{course.avgCompletion}%</p>
              </div>
              <div>
                <p className="text-xs text-[#14213D]/50 mb-1">Avg. Quiz Score</p>
                <p className="text-xl font-bold text-[#14213D]">
                  {course.avgQuizScore !== null ? `${course.avgQuizScore}%` : "—"}
                </p>
                <p className="text-xs text-[#14213D]/30">{course.totalQuizAttempts} attempts</p>
              </div>
              <div>
                <p className="text-xs text-[#14213D]/50 mb-1">Rating</p>
                <p className="text-xl font-bold text-[#14213D]">
                  {course.avgRating !== null ? `${course.avgRating} ★` : "—"}
                </p>
                <p className="text-xs text-[#14213D]/30">{course.totalReviews} reviews</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}