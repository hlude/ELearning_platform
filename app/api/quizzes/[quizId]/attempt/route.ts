import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const { quizId } = await params;
    const { answers } = await req.json();
    // answers should look like: [{ questionId: "...", selectedOptionId: "..." }]

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { include: { options: true } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    // Grade each answer
    let correctCount = 0;
    const gradedAnswers = quiz.questions.map((question) => {
      const submitted = answers.find((a: any) => a.questionId === question.id);
      const selectedOption = question.options.find((o) => o.id === submitted?.selectedOptionId);
      const isCorrect = !!selectedOption?.isCorrect;
      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        selectedText: selectedOption?.text ?? "",
        isCorrect,
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: user.userId,
        score,
        passed,
        answers: {
          create: gradedAnswers,
        },
      },
    });

    return NextResponse.json({ score, passed, correctCount, total: quiz.questions.length, attempt });
  } catch (err) {
    console.error("Quiz attempt error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}