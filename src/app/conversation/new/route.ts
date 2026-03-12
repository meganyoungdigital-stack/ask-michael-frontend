import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createConversation } from "@/lib/mongodb";

export async function POST() {

  try {

    const { userId } = await auth();

    if (!userId) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

    }

    const conversationId = await createConversation(userId);

    return NextResponse.json({
      conversationId,
      title: "New Chat"
    });

  } catch (error) {

    console.error("Error creating conversation:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );

  }

}