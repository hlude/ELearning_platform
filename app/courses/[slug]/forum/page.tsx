"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Thread = {
  id: string;
  title: string;
  createdAt: string;
  posts: { id: string }[];
};

export default function ForumListPage() {
  const { slug } = useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchThreads() {
    try {
      const res = await fetch(`/api/courses/${slug}/forum`);
      const data = await res.json();
      setThreads(data.threads ?? []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (slug) fetchThreads();
  }, [slug]);

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/courses/${slug}/forum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to create thread."); return; }
      setNewTitle("");
      fetchThreads();
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading discussions...</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#14213D] mb-1">
        Discussion
      </h1>
      <p className="text-[#14213D]/50 mb-6">Ask questions and discuss this course with others.</p>

      <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5 mb-8">
        <p className="font-semibold text-[#14213D] mb-2">Start a new discussion</p>
        <form onSubmit={handleCreateThread} className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What's your question?"
            className="flex-1 border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-[#14213D] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#1f2f57] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? "Posting..." : "Post"}
          </button>
        </form>
      </div>

      {threads.length === 0 && <p className="text-[#14213D]/50">No discussions yet — start one above.</p>}

      <div className="space-y-3">
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/forum/${thread.id}`}
            className="block bg-white border-2 border-[#14213D]/10 rounded-2xl p-4 hover:border-[#F2B705] hover:shadow-sm transition-all"
          >
            <p className="font-semibold text-[#14213D]">{thread.title}</p>
            <p className="text-sm text-[#14213D]/50 mt-1">
              {thread.posts.length} repl{thread.posts.length === 1 ? "y" : "ies"} · {new Date(thread.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
