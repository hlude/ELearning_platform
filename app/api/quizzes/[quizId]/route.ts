import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: { select: { title: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            // Deliberately NOT selecting isCorrect — students shouldn't see the answer
            options: { select: { id: true, text: true } },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (err) {
    console.error("Fetch quiz error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}