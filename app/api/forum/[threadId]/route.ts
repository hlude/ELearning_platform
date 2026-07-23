import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        course: { select: { title: true, slug: true } },
        posts: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true } } },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    return NextResponse.json({ thread });
  } catch (err) {
    console.error("Fetch thread error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}