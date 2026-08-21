"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewCoursePage() {
  const [form, setForm] = useState({ title: "", description: "", price: "0", category: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create course."); return; }
      setCreatedSlug(data.course.slug);
      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl shadow-sm p-8">
          <div className="text-4xl mb-2">✅</div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#14213D] mb-2">
            Course created!
          </h1>
          <p className="text-[#14213D]/60 mb-6">Now let's add some content to it.</p>
          <Link
            href={`/instructor/courses/${createdSlug}/manage`}
            className="inline-block bg-[#14213D] text-white rounded-full px-6 py-2.5 font-semibold hover:bg-[#1f2f57] transition-colors"
          >
            Manage Course Content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl shadow-sm p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#14213D] mb-6">
          Create a Course
        </h1>

        {error && (
          <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              placeholder="e.g. Web Development"
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">Price (USD)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14213D] text-white rounded-full py-3 font-semibold hover:bg-[#1f2f57] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}