import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { name: true } },
        modules: { include: { lessons: { select: { id: true } } } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.userId, courseId: course.id } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "You're not enrolled in this course." }, { status: 403 });
    }

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    if (lessonIds.length === 0) {
      return NextResponse.json({ error: "This course has no lessons yet." }, { status: 400 });
    }

    const completedCount = await prisma.lessonProgress.count({
      where: { studentId: user.userId, lessonId: { in: lessonIds }, completed: true },
    });

    if (completedCount < lessonIds.length) {
      return NextResponse.json(
        { error: "You must complete all lessons before getting a certificate." },
        { status: 400 }
      );
    }

    const student = await prisma.user.findUnique({ where: { id: user.userId } });

    // Issue (or fetch existing) certificate
    const certificate = await prisma.certificate.upsert({
      where: { studentId_courseId: { studentId: user.userId, courseId: course.id } },
      update: {},
      create: {
        studentId: user.userId,
        courseId: course.id,
        pdfUrl: "", // generated client-side, not stored as a file
      },
    });

    return NextResponse.json({
      certificate: {
        id: certificate.id,
        issuedAt: certificate.issuedAt,
        studentName: student?.name,
        courseTitle: course.title,
        instructorName: course.instructor.name,
      },
    });
  } catch (err) {
    console.error("Certificate error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}