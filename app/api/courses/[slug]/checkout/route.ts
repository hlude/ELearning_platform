import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to enroll." }, { status: 401 });
    }

    const { slug } = await params;

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const price = Number(course.price);
    if (price <= 0) {
      return NextResponse.json(
        { error: "This course is free — use the regular enroll endpoint." },
        { status: 400 }
      );
    }

  const existingEnrollment = await prisma.enrollment.findFirst({
  where: { studentId: user.userId, courseId: course.id },
});
    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course." }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
    metadata: {
  courseId: course.id,
  userId: user.userId,
},
      success_url: `${origin}/courses/${slug}?payment=success`,
      cancel_url: `${origin}/courses/${slug}?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong creating checkout session." }, { status: 500 });
  }
}