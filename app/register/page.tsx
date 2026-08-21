"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); return; }
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
            Account created!
          </h1>
          <p className="text-[#14213D]/60 mb-6">You can now log in with your new account.</p>
          <Link
            href="/login"
            className="inline-block bg-[#14213D] text-white rounded-full px-6 py-2.5 font-semibold hover:bg-[#1f2f57] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl shadow-sm p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#14213D] mb-6">
          Create an account
        </h1>

        {error && (
          <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D]/80 mb-1">I am a...</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            >
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14213D] text-white rounded-full py-3 font-semibold hover:bg-[#1f2f57] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-[#14213D]/60 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[#14213D] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
