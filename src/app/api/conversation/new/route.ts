import { NextResponse } from "next/server";
import { createConversation } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();

    console.log("USER ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - no userId" },
        { status: 401 }
      );
    }

    const conversationId = await createConversation(userId);

    return NextResponse.json({ conversationId });

  } catch (error) {
    console.error("🔥 NEW CONVERSATION ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}