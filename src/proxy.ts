import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/* =========================
   PROTECTED ROUTES
========================= */

const isProtectedRoute = createRouteMatcher([
  "/portal(.*)",
  "/conversation(.*)",
  "/api/conversation(.*)",
  "/api/documents(.*)",
]);

/* =========================
   MIDDLEWARE
========================= */

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

/* =========================
   MATCHER
========================= */

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/api/(.*)",
  ],
};