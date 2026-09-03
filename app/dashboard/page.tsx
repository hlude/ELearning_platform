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

type ProgressInfo = {
  completed: number;
  total: number;
  percent: number;
};

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"progress" | "done">("progress");

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch("/api/enrollments/me");
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load your courses."); return; }
        const list: Enrollment[] = data.enrollments;
        setEnrollments(list);

        // Fetch progress for each enrolled course
        const entries = await Promise.all(
          list.map(async (e) => {
            try {
              const [courseRes, progressRes] = await Promise.all([
                fetch(`/api/courses/${e.course.slug}`),
                fetch(`/api/courses/${e.course.slug}/progress`),
              ]);
              const courseData = await courseRes.json();
              const progressData = await progressRes.json();

              const totalLessons = (courseData.course?.modules ?? []).reduce(
                (sum: number, m: any) => sum + m.lessons.length,
                0
              );
              const completedLessons = Object.values(progressData.progress ?? {}).filter(Boolean).length;
              const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

              return [e.course.slug, { completed: completedLessons, total: totalLessons, percent }] as const;
            } catch {
              return [e.course.slug, { completed: 0, total: 0, percent: 0 }] as const;
            }
          })
        );
        setProgressMap(Object.fromEntries(entries));
      } catch (err) {
        setError("Something went wrong loading your dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading your courses...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;

  const inProgress = enrollments.filter((e) => (progressMap[e.course.slug]?.percent ?? 0) < 100);
  const completed = enrollments.filter((e) => (progressMap[e.course.slug]?.percent ?? 0) >= 100);

  const list = tab === "progress" ? inProgress : completed;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="text-sm font-semibold text-[#2F6F62] uppercase tracking-wide mb-2">Dashboard</p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[#14213D] mb-8">
        My Learning
      </h1>

      <div className="flex gap-2 border-b-2 border-[#14213D]/10 mb-8">
        <button
          onClick={() => setTab("progress")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-0.5 transition-colors ${
            tab === "progress" ? "border-[#F2B705] text-[#14213D]" : "border-transparent text-[#14213D]/40"
          }`}
        >
          In Progress ({inProgress.length})
        </button>
        <button
          onClick={() => setTab("done")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-0.5 transition-colors ${
            tab === "done" ? "border-[#F2B705] text-[#14213D]" : "border-transparent text-[#14213D]/40"
          }`}
        >
          Completed ({completed.length})
        </button>
      </div>

      {list.length === 0 && (
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-10 text-center">
          <p className="text-[#14213D]/60 mb-4">
            {tab === "progress" ? "No courses in progress." : "No completed courses yet."}
          </p>
          <Link
            href="/courses"
            className="inline-block bg-[#14213D] text-white rounded-full px-6 py-2.5 font-semibold hover:bg-[#1f2f57] transition-colors"
          >
            Browse courses
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {list.map((enrollment) => {
          const p = progressMap[enrollment.course.slug] ?? { completed: 0, total: 0, percent: 0 };
          return (
            <div key={enrollment.id} className="bg-white border-2 border-[#14213D]/10 rounded-2xl overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-[#14213D] to-[#2F6F62] flex items-center justify-center">
                <span className="font-[family-name:var(--font-display)] text-white text-2xl font-bold opacity-40">
                  {enrollment.course.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#14213D] text-sm line-clamp-2 mb-1">
                  {enrollment.course.title}
                </h3>
                <p className="text-xs text-[#14213D]/50 mb-3">{enrollment.course.instructor.name}</p>

                <div className="w-full bg-[#14213D]/10 rounded-full h-2 mb-1">
                  <div className="bg-[#F2B705] h-2 rounded-full transition-all" style={{ width: `${p.percent}%` }} />
                </div>
                <p className="text-xs text-[#14213D]/50 mb-4">
                  {p.completed} of {p.total} lessons · {p.percent}%
                </p>

                <Link
                  href={`/courses/${enrollment.course.slug}`}
                  className="block text-center bg-[#14213D] text-white rounded-full py-2 text-sm font-semibold hover:bg-[#1f2f57] transition-colors"
                >
                  {p.percent >= 100 ? "Review" : "▶ Continue"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}