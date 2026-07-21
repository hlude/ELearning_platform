import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { lessonId } = await params;
    const { completed } = await req.json();

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    // Save or update the progress record (one per student per lesson)
    const progress = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: user.userId,
          lessonId,
        },
      },
      update: {
        completed: !!completed,
      },
      create: {
        studentId: user.userId,
        lessonId,
        completed: !!completed,
      },
    });

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("Progress update error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}