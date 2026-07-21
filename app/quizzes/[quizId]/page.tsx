"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Option = { id: string; text: string };
type Question = { id: string; text: string; options: Option[] };
type Quiz = {
  id: string;
  passScore: number;
  lesson: { title: string };
  questions: Question[];
};

export default function TakeQuizPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; correctCount: number; total: number } | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Quiz not found."); return; }
        setQuiz(data.quiz);
      } catch (err) {
        setError("Something went wrong loading the quiz.");
      } finally {
        setLoading(false);
      }
    }
    if (quizId) fetchQuiz();
  }, [quizId]);

  function selectAnswer(questionId: string, optionId: string) {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionId });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quiz) return;

    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));

      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) { alert(data.error ?? "Failed to submit quiz."); return; }
      setResult(data);
    } catch (err) {
      alert("Something went wrong submitting the quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-center text-gray-500 mt-24">Loading quiz...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;
  if (!quiz) return null;

  if (result) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="text-4xl mb-2">{result.passed ? "🎉" : "📝"}</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {result.passed ? "You passed!" : "Keep practicing"}
          </h1>
          <p className="text-3xl font-bold text-gray-900 mb-1">{result.score}%</p>
          <p className="text-gray-500 mb-4">
            {result.correctCount}/{result.total} correct · Passing score: {quiz.passScore}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{quiz.lesson.title}</h1>
      <p className="text-gray-500 mb-6">Passing score: {quiz.passScore}%</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {quiz.questions.map((question, qIndex) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="font-semibold text-gray-900 mb-3">
              {qIndex + 1}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnswers[question.id] === option.id
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={selectedAnswers[question.id] === option.id}
                    onChange={() => selectAnswer(question.id, option.id)}
                    className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="bg-gray-900 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </form>
    </div>
  );
}
