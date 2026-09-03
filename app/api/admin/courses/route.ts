import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (err) {
    console.error("Admin fetch courses error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}