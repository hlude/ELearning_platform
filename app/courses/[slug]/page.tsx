"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Lesson = {
  id: string;
  title: string;
  type: string;
  durationSec: number | null;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  instructor: { name: string; bio: string | null };
  modules: Module[];
};

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Course not found."); return; }
        setCourse(data.course);
      } catch (err) {
        setError("Something went wrong loading this course.");
      } finally {
        setLoading(false);
      }
    }

    async function checkEnrollment() {
      try {
        const res = await fetch(`/api/courses/${slug}/enroll`);
        const data = await res.json();
        setEnrolled(data.enrolled);
      } catch (err) {}
    }

    async function fetchProgress() {
      try {
        const res = await fetch(`/api/courses/${slug}/progress`);
        const data = await res.json();
        setProgress(data.progress ?? {});
      } catch (err) {}
    }

    if (slug) {
      fetchCourse();
      checkEnrollment();
      fetchProgress();
    }
  }, [slug]);

  async function handleEnroll() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      const res = await fetch(`/api/courses/${slug}/enroll`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setEnrollError(data.error ?? "Failed to enroll."); return; }
      setEnrolled(true);
    } catch (err) {
      setEnrollError("Something went wrong. Please try again.");
    } finally {
      setEnrolling(false);
    }
  }

  async function toggleLessonComplete(lessonId: string, currentlyCompleted: boolean) {
    setProgress((prev) => ({ ...prev, [lessonId]: !currentlyCompleted }));
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentlyCompleted }),
      });
      if (!res.ok) setProgress((prev) => ({ ...prev, [lessonId]: currentlyCompleted }));
    } catch (err) {
      setProgress((prev) => ({ ...prev, [lessonId]: currentlyCompleted }));
    }
  }

  if (loading) return <p className="text-center text-gray-500 mt-24">Loading course...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;
  if (!course) return null;

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => progress[l.id]).length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        {course.category}
      </p>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
      <p className="text-gray-500 mb-4">Taught by {course.instructor.name}</p>

      <p className="text-gray-700 mb-4">{course.description}</p>
      <p className="text-2xl font-bold text-gray-900 mb-4">
        {Number(course.price) === 0 ? "Free" : `$${course.price}`}
      </p>

      {enrollError && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {enrollError}
        </p>
      )}

      {enrolled ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 font-medium">
          ✅ You're enrolled in this course!
        </div>
      ) : (
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="bg-gray-900 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {enrolling ? "Enrolling..." : "Enroll Now"}
        </button>
      )}

      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">Course Content</h2>

      {enrolled && totalLessons > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>{completedLessons} / {totalLessons} lessons complete</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {course.modules.length === 0 && <p className="text-gray-500">No modules added yet.</p>}

      <div className="space-y-4">
        {course.modules.map((module) => (
          <div key={module.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">{module.title}</h3>
            <ul className="space-y-1">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-2 py-1">
                  {enrolled && (
                    <input
                      type="checkbox"
                      checked={!!progress[lesson.id]}
                      onChange={() => toggleLessonComplete(lesson.id, !!progress[lesson.id])}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                  )}
                  <span className={progress[lesson.id] ? "line-through text-gray-400" : "text-gray-700"}>
                    {lesson.title}
                  </span>
                  <span className="text-xs text-gray-400">({lesson.type})</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
