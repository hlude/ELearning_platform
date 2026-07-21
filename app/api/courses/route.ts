import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Helper: turn "Intro to React" into "intro-to-react"
function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only instructors can create courses." },
        { status: 403 }
      );
    }

    const { title, description, price, category } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required." },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;

    // Make sure the slug is unique
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price: price ?? 0,
        category,
        instructorId: user.userId,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (err) {
    console.error("Course creation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: { instructor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (err) {
    console.error("Fetch courses error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}