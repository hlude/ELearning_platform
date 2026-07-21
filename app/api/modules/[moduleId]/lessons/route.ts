import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { moduleId } = await params;
    const { title, textContent } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const module_ = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module_) {
      return NextResponse.json({ error: "Module not found." }, { status: 404 });
    }

    if (module_.course.instructorId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't own this course." },
        { status: 403 }
      );
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });
    const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type: "TEXT",
        textContent: textContent ?? "",
        order: nextOrder,
        moduleId,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (err) {
    console.error("Lesson creation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}