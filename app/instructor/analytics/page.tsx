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

  if (loading) return <p className="text-center text-gray-500 mt-24">Loading analytics...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;

  const totalStudents = analytics.reduce((sum, c) => sum + c.totalEnrollments, 0);
  const totalCourses = analytics.length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Instructor Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Courses</p>
          <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
        </div>
      </div>

      {analytics.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
          <Link
            href="/instructor/courses/new"
            className="inline-block bg-gray-900 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-gray-800 transition-colors"
          >
            Create a Course
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {analytics.map((course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                  {course.status}
                </span>
              </div>
              <Link
                href={`/instructor/courses/${course.slug}/manage`}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Manage →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Students</p>
                <p className="text-xl font-bold text-gray-900">{course.totalEnrollments}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg. Completion</p>
                <p className="text-xl font-bold text-gray-900">{course.avgCompletion}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg. Quiz Score</p>
                <p className="text-xl font-bold text-gray-900">
                  {course.avgQuizScore !== null ? `${course.avgQuizScore}%` : "—"}
                </p>
                <p className="text-xs text-gray-400">{course.totalQuizAttempts} attempts</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Rating</p>
                <p className="text-xl font-bold text-gray-900">
                  {course.avgRating !== null ? `${course.avgRating} ★` : "—"}
                </p>
                <p className="text-xs text-gray-400">{course.totalReviews} reviews</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
