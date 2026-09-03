"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  instructor: { name: string };
};

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load courses."); return; }
        setCourses(data.courses);
      } catch (err) {
        setError("Something went wrong loading courses.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const categoryNames = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).sort(),
    [courses]
  );

  function toggleCategory(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const results = useMemo(() => {
    let out = courses.filter((c) => {
      const haystack = `${c.title} ${c.category}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (selectedCats.length && !selectedCats.includes(c.category)) return false;
      if (Number(c.price) > maxPrice) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "title") return a.title.localeCompare(b.title);
      return 0; // newest — keep original order (API already sorts by createdAt desc)
    });
    return out;
  }, [courses, query, selectedCats, maxPrice, sort]);

  function resetFilters() {
    setSelectedCats([]);
    setMaxPrice(200);
    setQuery("");
  }

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading courses...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-sm font-semibold text-[#2F6F62] uppercase tracking-wide mb-2">Catalog</p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[#14213D] mb-8">
        All Courses
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5 sticky top-6">
            {categoryNames.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#14213D] mb-3">Category</h3>
                <div className="space-y-2">
                  {categoryNames.map((name) => (
                    <label key={name} className="flex items-center gap-2 text-sm text-[#14213D]/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(name)}
                        onChange={() => toggleCategory(name)}
                        className="w-4 h-4 rounded border-[#14213D]/20 text-[#14213D] focus:ring-[#F2B705]"
                      />
                      {name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#14213D] mb-3">Max price · ${maxPrice}</h3>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#14213D]"
              />
            </div>

            <button
              onClick={resetFilters}
              className="w-full border-2 border-[#14213D]/15 text-[#14213D] rounded-full py-2 text-sm font-semibold hover:border-[#14213D]/40 transition-colors"
            >
              Reset filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search within results"
              className="flex-1 max-w-xs border-2 border-[#14213D]/15 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border-2 border-[#14213D]/15 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705]"
            >
              <option value="newest">Newest</option>
              <option value="title">Title A–Z</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>

          <p className="text-sm text-[#14213D]/60 mb-5">
            <span className="font-semibold text-[#14213D]">{results.length}</span>{" "}
            {results.length === 1 ? "course" : "courses"} found
          </p>

          {results.length === 0 ? (
            <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-10 text-center">
              <p className="text-[#14213D]/60 mb-4">No courses match those filters.</p>
              <button
                onClick={resetFilters}
                className="bg-[#14213D] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1f2f57]"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-6 hover:border-[#F2B705] hover:shadow-lg transition-all"
                >
                  <p className="text-xs font-semibold text-[#2F6F62] uppercase tracking-wide mb-2">
                    {course.category}
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#14213D] mb-1">
                    {course.title}
                  </h2>
                  <p className="text-sm text-[#14213D]/50 mb-3">by {course.instructor.name}</p>
                  <p className="text-sm text-[#14213D]/70 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#14213D]">
                      {Number(course.price) === 0 ? "Free" : `$${course.price}`}
                    </span>
                    <span className="text-sm font-semibold text-[#2F6F62]">View course →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}