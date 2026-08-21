import Link from "next/link";

const stats = [
  { value: "1", label: "Courses" },
  { value: "4", label: "Learners" },
  { value: "1", label: "Instructors" },
  { value: "100%", label: "Hands-on" },
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

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FBF7EF] to-[#F3EAD3]">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#14213D] text-[#F2B705] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            ✨ New courses added weekly
          </span>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-semibold text-[#14213D] leading-[1.1] mb-6">
            Learn skills that{" "}
            <span className="relative inline-block">
              actually ship
              <svg
                className="absolute left-0 -bottom-2 w-full"
                height="10"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7 Q 50 2, 100 6 T 198 5"
                  stroke="#F2B705"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-[#14213D]/70 text-lg max-w-xl mx-auto mb-10">
            Practical, project-driven courses taught by people who build for a
            living. Learn at your own pace, track your progress, earn a
            certificate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/courses"
              className="bg-[#14213D] text-[#FBF7EF] px-7 py-3.5 rounded-full font-semibold hover:bg-[#1f2f57] transition-colors"
            >
              Browse Courses →
            </Link>
            <Link
              href="/register"
              className="bg-white text-[#14213D] px-7 py-3.5 rounded-full font-semibold border-2 border-[#14213D]/15 hover:border-[#14213D]/40 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y-2 border-[#14213D]/10 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#14213D]">
                {s.value}
              </p>
              <p className="text-sm text-[#14213D]/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#2F6F62] uppercase tracking-wide mb-2">
            Why EduPlatform
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#14213D]">
            Built for people who want to build
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-6 hover:border-[#F2B705] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F2B705]/20 flex items-center justify-center text-[#14213D] font-bold mb-4">
                ✓
              </div>
              <h3 className="font-semibold text-[#14213D] mb-2">{f.title}</h3>
              <p className="text-sm text-[#14213D]/60">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#14213D] px-8 py-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_20%_0%,rgba(242,183,5,0.15),transparent)]" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold text-white mb-3">
              Start learning today
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              Your first course starts in under a minute — no subscription
              required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="bg-[#F2B705] text-[#14213D] px-7 py-3.5 rounded-full font-semibold hover:bg-[#e0a900] transition-colors"
              >
                Create free account
              </Link>
              <Link
                href="/courses"
                className="border-2 border-white/30 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Browse the catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
