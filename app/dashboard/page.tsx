
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Enrollment = {
  id: string;
  status: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    instructor: { name: string };
  };
};

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch("/api/enrollments/me");
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load your courses."); return; }
        setEnrollments(data.enrollments);
      } catch (err) {
        setError("Something went wrong loading your dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  if (loading) return <p className="text-center text-gray-500 mt-24">Loading your courses...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

      {enrollments.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
          <Link
            href="/courses"
            className="inline-block bg-gray-900 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-gray-800 transition-colors"
          >
            Browse courses
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <Link
            key={enrollment.id}
            href={`/courses/${enrollment.course.slug}`}
            className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {enrollment.course.category}
            </p>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {enrollment.course.title}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              by {enrollment.course.instructor.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
              <span>·</span>
              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                {enrollment.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
