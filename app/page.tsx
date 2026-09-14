"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=70",
];

const features = [
  {
    title: "Learn by shipping",
    body: "Every course ends with something real you can put in a portfolio.",
  },
  {
    title: "Vetted instructors",
    body: "Taught by people who do the work, not just talk about it.",
  },
  {
    title: "Track your progress",
    body: "Lesson-by-lesson tracking so you always know where you left off.",
  },
  {
    title: "Shareable certificates",
    body: "Finish a course and get a certificate worth showing off.",
  },
];

type Stats = {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
};

export default function HomePage() {
  const [imageIndex, setImageIndex] = useState(0);
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, totalStudents: 0, totalInstructors: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        // keep defaults on failure
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { value: String(stats.totalCourses), label: "Courses" },
    { value: String(stats.totalStudents), label: "Learners" },
    { value: String(stats.totalInstructors), label: "Instructors" },
    { value: "100%", label: "Hands-on" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {heroImages.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === imageIndex ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B33]/90 via-[#152544]/85 to-[#0A1428]/90" />

        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/15 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-500/20">
            ✨ New courses added weekly
          </span>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-semibold text-white leading-[1.1] mb-6">
            Learn skills that{" "}
            <span className="text-blue-400">actually ship</span>
          </h1>

          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            Practical, project-driven courses taught by people who build for a
            living. Learn at your own pace, track your progress, earn a
            certificate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/courses"
              className="bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-blue-500 transition-colors"
            >
              Browse Courses →
            </Link>
            <Link
              href="/register"
              className="bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {statCards.map((s) => (
            <div key={s.label}>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#0F1B33]">
                {s.value}
              </p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
              Why eLearning Platform
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#0F1B33]">
              Built for people who want to build
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-4">
                  ✓
                </div>
                <h3 className="font-semibold text-[#0F1B33] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1B33] via-[#152544] to-[#0A1428] px-8 py-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_20%_0%,rgba(59,130,246,0.15),transparent)]" />
            <div className="relative">
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold text-white mb-3">
                Start learning today
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-8">
                Your first course starts in under a minute — no subscription
                required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-blue-500 transition-colors"
                >
                  Create free account
                </Link>
                <Link
                  href="/courses"
                  className="border border-white/20 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors"
                >
                  Browse the catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}