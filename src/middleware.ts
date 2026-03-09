import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
]);

export default clerkMiddleware(async (auth, req) => {

  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      await auth.protect();
    }
  }

});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
  ],
};