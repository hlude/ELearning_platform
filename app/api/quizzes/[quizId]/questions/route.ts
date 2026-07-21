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
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { quizId } = await params;
    const { text, options } = await req.json();
    // options should look like: [{ text: "Paris", isCorrect: true }, { text: "London", isCorrect: false }]

    if (!text || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Question text and at least 2 options are required." },
        { status: 400 }
      );
    }

    if (!options.some((o: any) => o.isCorrect)) {
      return NextResponse.json(
        { error: "At least one option must be marked correct." },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { lesson: { include: { module: { include: { course: true } } } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    if (quiz.lesson.module.course.instructorId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't own this course." },
        { status: 403 }
      );
    }

    const lastQuestion = await prisma.question.findFirst({
      where: { quizId },
      orderBy: { order: "desc" },
    });
    const nextOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    const question = await prisma.question.create({
      data: {
        quizId,
        text,
        type: "MULTIPLE_CHOICE",
        order: nextOrder,
        options: {
          create: options.map((o: { text: string; isCorrect: boolean }) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (err) {
    console.error("Question creation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}