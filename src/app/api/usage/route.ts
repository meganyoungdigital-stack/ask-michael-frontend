export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { getUserUsage } from "@/lib/mongodb";
import { getOrCreateUser } from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const usageCount = await getUserUsage(userId);

    const user = await getOrCreateUser(userId);

    const dailyLimit = user.isPro ? 1000 : 50;

    return Response.json({
      usageCount,
      isPro: user.isPro,
      dailyLimit,
    });
  } catch (error) {
    console.error("[USAGE_API_ERROR]", error);
    return new Response("Internal server error", {
      status: 500,
    });
  }
}