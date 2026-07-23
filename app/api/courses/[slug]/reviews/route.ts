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
      return NextResponse.json({ error: "Please log in to leave a review." }, { status: 401 });
    }

    const { slug } = await params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Only enrolled students can review
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.userId, courseId: course.id } },
    });
    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled to leave a review." },
        { status: 403 }
      );
    }

    // Upsert: one review per student per course, editable
    const review = await prisma.review.upsert({
      where: { courseId_studentId: { courseId: course.id, studentId: user.userId } },
      update: { rating, comment },
      create: { courseId: course.id, studentId: user.userId, rating, comment },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("Review creation error:", err);
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
      return NextResponse.json({ reviews: [], average: 0 });
    }

    const reviews = await prisma.review.findMany({
      where: { courseId: course.id },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const average =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, average: Math.round(average * 10) / 10 });
  } catch (err) {
    console.error("Fetch reviews error:", err);
    return NextResponse.json({ reviews: [], average: 0 });
  }
}