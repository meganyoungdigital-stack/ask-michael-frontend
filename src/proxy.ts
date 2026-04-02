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

    } catch (error) {
      console.error("Middleware DB error:", error);

      // Fail-safe
      return NextResponse.next();
    }
  }

  return NextResponse.next();
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