import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to reply." }, { status: 401 });
    }

    const { threadId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Reply cannot be empty." }, { status: 400 });
    }

    const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    const post = await prisma.forumPost.create({
      data: {
        threadId,
        authorId: user.userId,
        content,
      },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("Post creation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}