import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.course.update({
    where: { slug: "intro-to-web-development" },
    data: {
      subtitle: "A hands-on introduction to building websites with HTML, CSS, and JavaScript.",
      level: "Beginner",
      language: "English",
      bestseller: true,
      tags: ["HTML", "CSS", "JavaScript"],
      requirements: [
        "A computer with internet access",
        "No prior experience needed",
      ],
      whatYouLearn: [
        "Build a webpage from scratch",
        "Understand HTML structure",
        "Style pages with CSS",
        "Add interactivity with JavaScript",
      ],
    },
  });

  console.log("Updated course:", updated.title);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });