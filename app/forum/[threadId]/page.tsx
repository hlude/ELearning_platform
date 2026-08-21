"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
};

type Thread = {
  id: string;
  title: string;
  course: { title: string; slug: string };
  posts: Post[];
};

export default function ThreadDetailPage() {
  const { threadId } = useParams();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);

  async function fetchThread() {
    try {
      const res = await fetch(`/api/forum/${threadId}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Thread not found."); return; }
      setThread(data.thread);
    } catch (err) {
      setError("Something went wrong loading this discussion.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (threadId) fetchThread();
  }, [threadId]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/forum/${threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to post reply."); return; }
      setReplyContent("");
      fetchThread();
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setReplying(false);
    }
  }

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading discussion...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;
  if (!thread) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href={`/courses/${thread.course.slug}/forum`}
        className="text-sm text-[#2F6F62] font-semibold hover:underline mb-4 inline-block"
      >
        ← Back to {thread.course.title} discussions
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#14213D] mb-6">
        {thread.title}
      </h1>

      <div className="space-y-3 mb-8">
        {thread.posts.length === 0 && (
          <p className="text-[#14213D]/50">No replies yet — be the first to respond.</p>
        )}
        {thread.posts.map((post) => (
          <div key={post.id} className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-[#14213D] text-sm">{post.author.name}</p>
              <p className="text-xs text-[#14213D]/30">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <p className="text-[#14213D]/70 text-sm">{post.content}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-5">
        <p className="font-semibold text-[#14213D] mb-2">Add a reply</p>
        <form onSubmit={handleReply}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={3}
            className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={replying}
            className="bg-[#14213D] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#1f2f57] transition-colors disabled:opacity-50"
          >
            {replying ? "Posting..." : "Post Reply"}
          </button>
        </form>
      </div>
    </div>
  );
}
