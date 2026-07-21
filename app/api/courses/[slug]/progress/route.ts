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
      return NextResponse.json({ progress: {} });
    }

    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ progress: {} });
    }

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    const progressRecords = await prisma.lessonProgress.findMany({
      where: {
        studentId: user.userId,
        lessonId: { in: lessonIds },
      },
    });

    // Turn into a simple { lessonId: true/false } map for easy frontend use
    const progressMap: Record<string, boolean> = {};
    for (const record of progressRecords) {
      progressMap[record.lessonId] = record.completed;
    }

    return NextResponse.json({ progress: progressMap });
  } catch (err) {
    console.error("Fetch progress error:", err);
    return NextResponse.json({ progress: {} });
  }
}