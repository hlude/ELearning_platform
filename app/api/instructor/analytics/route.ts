import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { instructorId: user.userId },
      include: {
        enrollments: true,
        reviews: true,
        modules: {
          include: {
            lessons: {
              include: {
                progress: true,
                quiz: { include: { attempts: true } },
              },
            },
          },
        },
      },
    });

    const analytics = courses.map((course) => {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const totalEnrollments = course.enrollments.length;

      // Average completion: for each enrolled student, % of lessons they've completed
      let completionSum = 0;
      if (totalEnrollments > 0 && totalLessons > 0) {
        for (const enrollment of course.enrollments) {
          let completedForStudent = 0;
          for (const module of course.modules) {
            for (const lesson of module.lessons) {
              const done = lesson.progress.find(
                (p) => p.studentId === enrollment.studentId && p.completed
              );
              if (done) completedForStudent++;
            }
          }
          completionSum += completedForStudent / totalLessons;
        }
      }
      const avgCompletion = totalEnrollments > 0 ? Math.round((completionSum / totalEnrollments) * 100) : 0;

      // Quiz stats: average score across all attempts on all quizzes in this course
      const allAttempts = course.modules.flatMap((m) =>
        m.lessons.flatMap((l) => l.quiz?.attempts ?? [])
      );
      const avgQuizScore =
        allAttempts.length > 0
          ? Math.round(allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length)
          : null;

      const avgRating =
        course.reviews.length > 0
          ? Math.round((course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length) * 10) / 10
          : null;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        status: course.status,
        totalEnrollments,
        avgCompletion,
        avgQuizScore,
        totalQuizAttempts: allAttempts.length,
        avgRating,
        totalReviews: course.reviews.length,
      };
    });

    return NextResponse.json({ analytics });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}