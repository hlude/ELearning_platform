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
      return NextResponse.json({ error: "Please log in to start a discussion." }, { status: 401 });
    }

    const { slug } = await params;
    const { title } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const thread = await prisma.forumThread.create({
      data: { title, courseId: course.id },
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (err) {
    console.error("Thread creation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ threads: [] });
    }

    const threads = await prisma.forumThread.findMany({
      where: { courseId: course.id },
      include: { posts: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ threads });
  } catch (err) {
    console.error("Fetch threads error:", err);
    return NextResponse.json({ threads: [] });
  }
}