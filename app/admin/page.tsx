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

  if (loading) return <p className="text-center text-gray-500 mt-24">Loading admin panel...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-500 mb-8">Manage users and courses across the platform.</p>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("courses")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "courses" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"
          }`}
        >
          Courses ({courses.length})
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "users" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {tab === "courses" && (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-500">
                    by {course.instructor.name} ({course.instructor.email})
                  </p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                  {course.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {course._count.enrollments} students · {course._count.reviews} reviews
              </p>
              <div className="flex gap-2 flex-wrap">
                {course.status !== "PUBLISHED" && (
                  <button
                    onClick={() => updateCourseStatus(course.id, "PUBLISHED")}
                    className="bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-green-700"
                  >
                    Publish
                  </button>
                )}
                {course.status !== "REJECTED" && (
                  <button
                    onClick={() => updateCourseStatus(course.id, "REJECTED")}
                    className="bg-yellow-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-yellow-700"
                  >
                    Reject
                  </button>
                )}
                {course.status !== "ARCHIVED" && (
                  <button
                    onClick={() => updateCourseStatus(course.id, "ARCHIVED")}
                    className="bg-gray-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-700"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
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
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u._count.coursesCreated}</td>
                  <td className="px-4 py-3 text-gray-600">{u._count.enrollments}</td>
                  <td className="px-4 py-3 text-gray-400">
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
