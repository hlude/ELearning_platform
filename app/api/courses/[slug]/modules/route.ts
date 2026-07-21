import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { slug } = await params;
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    if (course.instructorId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't own this course." },
        { status: 403 }
      );
    }

    const lastModule = await prisma.module.findFirst({
      where: { courseId: course.id },
      orderBy: { order: "desc" },
    });
    const nextOrder = lastModule ? lastModule.order + 1 : 1;

    const module_ = await prisma.module.create({
      data: {
        title,
        order: nextOrder,
        courseId: course.id,
      },
    });

    return NextResponse.json({ module: module_ }, { status: 201 });
  } catch (err) {
    console.error("Module creation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}