"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  instructor: { name: string };
};

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load courses.");
          return;
        }

        setCourses(data.courses);
      } catch (err) {
        setError("Something went wrong loading courses.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 mt-24">Loading courses...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 mt-24">{error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Courses</h1>

      {courses.length === 0 && (
        <p className="text-gray-500">No courses published yet.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.slug}`}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {course.category}
            </p>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {course.title}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              by {course.instructor.name}
            </p>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">
                {Number(course.price) === 0 ? "Free" : `$${course.price}`}
              </span>
              <span className="text-sm font-medium text-gray-900">
                View course →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
