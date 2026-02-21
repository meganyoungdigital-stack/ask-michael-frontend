import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { saveConversation } from "@/lib/mongodb";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    const conversationId = uuidv4();

    await saveConversation(
      conversationId,
      userId,
      [],                        // messages
      "New Engineering Project", // title
      "General",                 // projectType
      false                      // isoMode
    );

    return Response.json({ conversationId }, { status: 201 });

  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`[CONVERSATION_NEW_ERROR] ${errorMsg}`);

    return Response.json(
      { error: "Failed to create new conversation" },
      { status: 500 }
    );
  }
}
