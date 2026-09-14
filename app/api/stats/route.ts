import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalCourses, totalStudents, totalInstructors] = await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    ]);

    return NextResponse.json({ totalCourses, totalStudents, totalInstructors });
  } catch (err) {
    console.error("Fetch stats error:", err);
    return NextResponse.json({ totalCourses: 0, totalStudents: 0, totalInstructors: 0 });
  }
}