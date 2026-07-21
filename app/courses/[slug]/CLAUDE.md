# Project: Online Course Platform (Final Year CS Project)

## Stack
- Next.js (App Router), TypeScript
- Prisma ORM (database)
- Custom cookie/JWT-based auth (see `lib/auth.ts`, uses `getUserFromRequest`)

## What's already built and working
- ✅ Database setup, user Register, Login, and route protection
- ✅ Course creation (instructors can create courses)
- ✅ Course catalog page (lists all courses)
- ✅ Course detail page (`app/courses/[slug]/page.tsx`)
- ✅ Module & Lesson creation (instructors can add modules and lessons to a course)
- ✅ Enrollment system — students can click "Enroll Now" on a course detail page,
  which calls `app/api/courses/[slug]/enroll/route.ts` (POST to enroll, GET to check
  enrollment status). Confirmed working end-to-end: enrolling, duplicate-enrollment
  prevention (409), and instructors can't enroll in their own course (400).

## Known accounts used for testing
- Instructor: (created via Register, owns "Intro to Web Development" course)
- Student: `test@test.com`

## Current gaps / not yet built
- No logout button — currently logging out by manually deleting the auth cookie
  in DevTools, which isn't a real solution
- Lessons show as a list but can't be clicked into / viewed individually yet
  (no lesson content page)
- No "My Courses" page for students to see what they're enrolled in
- No instructor dashboard (their created courses, enrollment counts, etc.)

## Suggested next steps (pick one to start)
1. Lesson content page — let students click a lesson and view its content
2. Logout button — proper logout flow (clear auth cookie via a POST route)
3. "My Courses" page — enrolled courses view for students
4. Instructor dashboard — courses created, enrollment counts

## Notes on working style
- Prefer small, testable steps: implement one route/page at a time, then verify
  in the browser before moving to the next
- Route handlers in this project use named exports per HTTP method
  (`export async function POST(...)`), not `export default` — this caused a bug
  before, so keep following this pattern