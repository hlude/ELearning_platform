import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const viewer = await getUserFromRequest(req);

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true, bio: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            student: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, type: true, durationSec: true, quiz: { select: { id: true } } },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const totalReviews = course.reviews.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
          )
        : 0;

    const isOwner = viewer?.userId === course.instructor.id;
    const isAdmin = viewer?.role === "ADMIN";

    const responseCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      category: course.category,
      status: course.status,
      instructor: course.instructor,
      modules: course.modules,
      reviews: course.reviews,
      rating: avgRating,
      reviewCount: totalReviews,
      students: course._count.enrollments,
      isOwner,
      isAdmin,
    };

    return NextResponse.json({ course: responseCourse });
  } catch (err) {
    console.error("Fetch course error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}