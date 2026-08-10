import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { name: true, bio: true } },
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

    const totalSeconds = course.modules.reduce(
      (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0),
      0
    );
    const hours = Math.round(totalSeconds / 3600);

    const responseCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      subtitle: course.subtitle,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      discountPrice: course.discountPrice,
      category: course.category,
      level: course.level,
      language: course.language,
      bestseller: course.bestseller,
      tags: course.tags,
      requirements: course.requirements,
      whatYouLearn: course.whatYouLearn,
      instructor: course.instructor,
      modules: course.modules,
      reviews: course.reviews,
      rating: avgRating,
      reviewCount: totalReviews,
      students: course._count.enrollments,
      hours,
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