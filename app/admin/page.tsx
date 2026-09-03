"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { coursesCreated: number; enrollments: number };
};

type Course = {
  id: string;
  title: string;
  slug: string;
  status: string;
  instructor: { name: string; email: string };
  _count: { enrollments: number; reviews: number };
};

export default function AdminPage() {
  const [tab, setTab] = useState<"courses" | "users">("courses");
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/courses"),
      ]);
      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      if (!usersRes.ok) { setError(usersData.error ?? "Access denied."); return; }
      setUsers(usersData.users ?? []);
      setCourses(coursesData.courses ?? []);
    } catch (err) {
      setError("Something went wrong loading admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function updateCourseStatus(courseId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { alert("Failed to update course."); return; }
      fetchData();
    } catch (err) {
      alert("Something went wrong.");
    }
  }

  async function deleteCourse(courseId: string) {
    if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) { alert("Failed to delete course."); return; }
      fetchData();
    } catch (err) {
      alert("Something went wrong.");
    }
  }

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading admin panel...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#14213D] mb-2">
        Admin Panel
      </h1>
      <p className="text-[#14213D]/50 mb-8">Manage users and courses across the platform.</p>

      <div className="flex gap-2 mb-6 border-b-2 border-[#14213D]/10">
        <button
          onClick={() => setTab("courses")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-0.5 transition-colors ${
            tab === "courses" ? "border-[#F2B705] text-[#14213D]" : "border-transparent text-[#14213D]/40"
          }`}
        >
          Courses ({courses.length})
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-0.5 transition-colors ${
            tab === "users" ? "border-[#F2B705] text-[#14213D]" : "border-transparent text-[#14213D]/40"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {tab === "courses" && (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-[#14213D]">{course.title}</p>
                  <p className="text-sm text-[#14213D]/50">
                    by {course.instructor?.name ?? "Unknown"} ({course.instructor?.email ?? "—"})
                  </p>
                </div>
                <span className="text-xs bg-[#F2B705]/20 text-[#14213D] px-2 py-1 rounded-full font-semibold">
                  {course.status}
                </span>
              </div>
              <p className="text-sm text-[#14213D]/50 mb-3">
                {course._count?.enrollments ?? 0} students · {course._count?.reviews ?? 0} reviews
              </p>
              <div className="flex gap-2 flex-wrap">
                {course.status !== "PUBLISHED" && (
                  <button
                    onClick={() => updateCourseStatus(course.id, "PUBLISHED")}
                    className="bg-[#2F6F62] text-white rounded-full px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                  >
                    Publish
                  </button>
                )}
                {course.status !== "REJECTED" && (
                  <button
                    onClick={() => updateCourseStatus(course.id, "REJECTED")}
                    className="bg-yellow-600 text-white rounded-full px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                  >
                    Reject
                  </button>
                )}
                {course.status !== "ARCHIVED" && (
                  <button
                    onClick={() => updateCourseStatus(course.id, "ARCHIVED")}
                    className="bg-[#14213D]/60 text-white rounded-full px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="bg-red-600 text-white rounded-full px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#14213D]/5 text-[#14213D]/60 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Enrollments</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#14213D]/5">
                  <td className="px-4 py-3 font-medium text-[#14213D]">{u.name}</td>
                  <td className="px-4 py-3 text-[#14213D]/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#F2B705]/20 text-[#14213D] px-2 py-0.5 rounded-full font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#14213D]/60">{u._count?.coursesCreated ?? 0}</td>
                  <td className="px-4 py-3 text-[#14213D]/60">{u._count?.enrollments ?? 0}</td>
                  <td className="px-4 py-3 text-[#14213D]/30">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}