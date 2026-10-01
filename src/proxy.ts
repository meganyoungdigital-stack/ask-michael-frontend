import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

/* =========================
   PROTECTED ROUTES
========================= */

const isProtectedRoute = createRouteMatcher([
  "/portal(.*)",
  "/api/conversation(.*)",
  "/api/documents(.*)",
]);

/* =========================
   PORTAL ROUTE CHECK
========================= */

const isPortalRoute = createRouteMatcher([
  "/portal(.*)",
]);

/* =========================
   MIDDLEWARE
========================= */

export default clerkMiddleware(async (auth, req) => {
  // 🔐 Protect routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  /* =========================
     TIER ENFORCEMENT
  ========================= */

  if (isPortalRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    try {
      const { db } = await connectToDatabase();

      const user = await db.collection("users").findOne({
        userId,
      });

      const tier = user?.tier || "free";
      const status = user?.subscriptionStatus || "inactive";

      // 🚫 Only block cancelled paid users
      if (tier !== "free" && status === "cancelled") {
        return NextResponse.redirect(new URL("/pricing", req.url));
      }

        } catch {

      // Fail-safe
      return NextResponse.next();
    }
  }

    const response = NextResponse.next();

  response.headers.set(
    "X-Frame-Options",
    "DENY"
  );

  response.headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
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