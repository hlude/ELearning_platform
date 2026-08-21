"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Option = { text: string; isCorrect: boolean };

type Lesson = {
  id: string;
  title: string;
  type: string;
  quiz?: { id: string } | null;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  modules: Module[];
};

export default function ManageCoursePage() {
  const { slug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; textContent: string }>>({});
  const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);

  const [quizTitleForms, setQuizTitleForms] = useState<Record<string, string>>({});
  const [addingQuizFor, setAddingQuizFor] = useState<string | null>(null);

  const [questionForms, setQuestionForms] = useState<
    Record<string, { text: string; options: Option[] }>
  >({});
  const [addingQuestionFor, setAddingQuestionFor] = useState<string | null>(null);

  async function fetchCourse() {
    try {
      const res = await fetch(`/api/courses/${slug}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Course not found."); return; }
      setCourse(data.course);
    } catch (err) {
      setError("Something went wrong loading this course.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (slug) fetchCourse();
  }, [slug]);

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    try {
      const res = await fetch(`/api/courses/${slug}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newModuleTitle }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to add module."); return; }
      setNewModuleTitle("");
      fetchCourse();
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setAddingModule(false);
    }
  }

  async function handleAddLesson(moduleId: string, e: React.FormEvent) {
    e.preventDefault();
    const form = lessonForms[moduleId];
    if (!form || !form.title.trim()) return;
    setAddingLessonFor(moduleId);
    try {
      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, textContent: form.textContent }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to add lesson."); return; }
      setLessonForms({ ...lessonForms, [moduleId]: { title: "", textContent: "" } });
      fetchCourse();
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setAddingLessonFor(null);
    }
  }

  async function handleAddQuiz(moduleId: string, e: React.FormEvent) {
    e.preventDefault();
    const title = quizTitleForms[moduleId];
    if (!title || !title.trim()) return;
    setAddingQuizFor(moduleId);
    try {
      const res = await fetch(`/api/modules/${moduleId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, passScore: 70 }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to add quiz."); return; }
      setQuizTitleForms({ ...quizTitleForms, [moduleId]: "" });
      fetchCourse();
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setAddingQuizFor(null);
    }
  }

  function getQuestionForm(quizId: string) {
    return questionForms[quizId] ?? { text: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] };
  }

  function updateQuestionText(quizId: string, text: string) {
    const form = getQuestionForm(quizId);
    setQuestionForms({ ...questionForms, [quizId]: { ...form, text } });
  }

  function updateOptionText(quizId: string, index: number, text: string) {
    const form = getQuestionForm(quizId);
    const options = [...form.options];
    options[index] = { ...options[index], text };
    setQuestionForms({ ...questionForms, [quizId]: { ...form, options } });
  }

  function setCorrectOption(quizId: string, index: number) {
    const form = getQuestionForm(quizId);
    const options = form.options.map((o, i) => ({ ...o, isCorrect: i === index }));
    setQuestionForms({ ...questionForms, [quizId]: { ...form, options } });
  }

  function addOptionField(quizId: string) {
    const form = getQuestionForm(quizId);
    setQuestionForms({ ...questionForms, [quizId]: { ...form, options: [...form.options, { text: "", isCorrect: false }] } });
  }

  async function handleAddQuestion(quizId: string, e: React.FormEvent) {
    e.preventDefault();
    const form = getQuestionForm(quizId);
    if (!form.text.trim()) { alert("Question text is required."); return; }
    if (form.options.some((o) => !o.text.trim())) { alert("All options need text."); return; }
    if (!form.options.some((o) => o.isCorrect)) { alert("Select which option is correct."); return; }

    setAddingQuestionFor(quizId);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: form.text, options: form.options }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to add question."); return; }
      setQuestionForms({
        ...questionForms,
        [quizId]: { text: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] },
      });
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setAddingQuestionFor(null);
    }
  }

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading...</p>;
  if (error) return <p className="text-center text-red-600 mt-24">{error}</p>;
  if (!course) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#14213D] mb-2">
        Manage: {course.title}
      </h1>
      <p className="text-[#14213D]/50 mb-8">Add modules, lessons, and quizzes to build out your course.</p>

      <div className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-[#14213D] mb-3">Add a Module</h2>
        <form onSubmit={handleAddModule} className="flex gap-2">
          <input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="e.g. Getting Started"
            className="flex-1 border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={addingModule}
            className="bg-[#14213D] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#1f2f57] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {addingModule ? "Adding..." : "Add Module"}
          </button>
        </form>
      </div>

      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#14213D] mb-4">
        Course Content
      </h2>
      {course.modules.length === 0 && <p className="text-[#14213D]/50">No modules yet — add one above.</p>}

      <div className="space-y-6">
        {course.modules.map((module) => (
          <div key={module.id} className="bg-white border-2 border-[#14213D]/10 rounded-2xl p-6">
            <h3 className="font-semibold text-[#14213D] mb-3">{module.title}</h3>

            <ul className="space-y-1 mb-4">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="text-sm text-[#14213D]/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#F2B705] rounded-full" />
                  {lesson.title}
                  <span className="text-xs text-[#14213D]/30">({lesson.type})</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#14213D]/10 pt-4">
              <p className="text-sm font-semibold text-[#14213D]/80 mb-2">Add a text lesson</p>
              <form onSubmit={(e) => handleAddLesson(module.id, e)} className="space-y-2">
                <input
                  placeholder="Lesson title"
                  value={lessonForms[module.id]?.title ?? ""}
                  onChange={(e) => setLessonForms({ ...lessonForms, [module.id]: { title: e.target.value, textContent: lessonForms[module.id]?.textContent ?? "" } })}
                  className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
                />
                <textarea
                  placeholder="Lesson content (text)"
                  value={lessonForms[module.id]?.textContent ?? ""}
                  onChange={(e) => setLessonForms({ ...lessonForms, [module.id]: { title: lessonForms[module.id]?.title ?? "", textContent: e.target.value } })}
                  rows={3}
                  className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={addingLessonFor === module.id}
                  className="bg-[#14213D]/10 text-[#14213D] rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-[#14213D]/20 transition-colors disabled:opacity-50"
                >
                  {addingLessonFor === module.id ? "Adding..." : "Add Lesson"}
                </button>
              </form>
            </div>

            <div className="border-t border-[#14213D]/10 pt-4 mt-4">
              <p className="text-sm font-semibold text-[#14213D]/80 mb-2">Add a quiz</p>
              <form onSubmit={(e) => handleAddQuiz(module.id, e)} className="flex gap-2">
                <input
                  placeholder="Quiz title, e.g. Module 1 Quiz"
                  value={quizTitleForms[module.id] ?? ""}
                  onChange={(e) => setQuizTitleForms({ ...quizTitleForms, [module.id]: e.target.value })}
                  className="flex-1 border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={addingQuizFor === module.id}
                  className="bg-[#14213D]/10 text-[#14213D] rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-[#14213D]/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {addingQuizFor === module.id ? "Adding..." : "Add Quiz"}
                </button>
              </form>
            </div>

            {module.lessons
              .filter((l) => l.type === "QUIZ" && l.quiz)
              .map((quizLesson) => {
                const quizId = quizLesson.quiz!.id;
                const form = getQuestionForm(quizId);
                return (
                  <div key={quizId} className="border-t border-[#14213D]/10 pt-4 mt-4">
                    <div className="bg-[#F2B705]/10 rounded-xl p-4">
                      <p className="text-sm font-semibold text-[#14213D] mb-3">
                        Add a question to "{quizLesson.title}"
                      </p>
                      <form onSubmit={(e) => handleAddQuestion(quizId, e)} className="space-y-2">
                        <input
                          placeholder="Question text"
                          value={form.text}
                          onChange={(e) => updateQuestionText(quizId, e.target.value)}
                          className="w-full border-2 border-[#14213D]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
                        />
                        {form.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${quizId}`}
                              checked={opt.isCorrect}
                              onChange={() => setCorrectOption(quizId, i)}
                              className="w-4 h-4 text-[#14213D] focus:ring-[#F2B705]"
                            />
                            <input
                              placeholder={`Option ${i + 1}`}
                              value={opt.text}
                              onChange={(e) => updateOptionText(quizId, i, e.target.value)}
                              className="flex-1 border-2 border-[#14213D]/15 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent"
                            />
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => addOptionField(quizId)}
                            className="text-sm text-[#2F6F62] hover:underline font-semibold"
                          >
                            + Add option
                          </button>
                          <button
                            type="submit"
                            disabled={addingQuestionFor === quizId}
                            className="bg-[#14213D] text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-[#1f2f57] transition-colors disabled:opacity-50 ml-auto"
                          >
                            {addingQuestionFor === quizId ? "Adding..." : "Add Question"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}