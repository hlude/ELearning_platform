"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
  setError(data.error ?? "Login failed.");
  return;
}

const role = data.user?.role;
if (role === "ADMIN") {
  router.push("/admin");
} else if (role === "INSTRUCTOR") {
  router.push("/instructor/analytics");
} else {
  router.push("/dashboard");
}
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl shadow-sm p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#14213D] mb-6">
          Log in
        </h1>

        {error && (
          <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14213D] text-white rounded-full py-3 font-semibold hover:bg-[#1f2f57] transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-[#14213D]/60 mt-6 text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#14213D] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
