import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
 const user = await getUserFromRequest(req);
if (!user) {
  return NextResponse.json({ error: "Not logged in." }, { status: 401 });
}
if (user.role === "ADMIN") {
  return NextResponse.json({ error: "Admins don't have student enrollments." }, { status: 403 });
}
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            thumbnailUrl: true,
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({ enrollments });
  } catch (err) {
    console.error("Fetch enrollments error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}