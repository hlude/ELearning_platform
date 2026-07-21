import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
        Learn new skills, on your own time.
      </h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        Browse courses taught by real instructors, track your progress, and
        earn certificates as you go.
      </p>

      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/courses"
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Browse Courses
        </Link>
        <Link
          href="/register"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
