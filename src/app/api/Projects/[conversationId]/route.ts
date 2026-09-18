import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserConversations } from "@/lib/mongodb";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const conversations = await getUserConversations(userId);

    return NextResponse.json(conversations);
  } catch (err) {
    console.error("Project conversations fetch error:", err);

    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}