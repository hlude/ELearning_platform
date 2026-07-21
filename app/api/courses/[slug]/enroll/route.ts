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
      return NextResponse.json({ error: "Please log in to enroll." }, { status: 401 });
    }

    const { slug } = await params;

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Prevent instructors from "enrolling" in their own course by mistake
    if (course.instructorId === user.userId) {
      return NextResponse.json(
        { error: "You can't enroll in your own course." },
        { status: 400 }
      );
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.userId,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You're already enrolled in this course." },
        { status: 409 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: user.userId,
        courseId: course.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (err) {
    console.error("Enrollment error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Check if the current user is already enrolled (used by the frontend)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ enrolled: false });
    }

    const { slug } = await params;
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ enrolled: false });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.userId,
          courseId: course.id,
        },
      },
    });

    return NextResponse.json({ enrolled: !!existing });
  } catch (err) {
    return NextResponse.json({ enrolled: false });
  }
}
