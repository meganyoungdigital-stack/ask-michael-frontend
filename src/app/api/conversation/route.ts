export async function GET(request: Request) {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { getConversation, getConversationsForUser } = await import("@/lib/mongodb");
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized - please sign in" }, { status: 401 });
    }
    const url = new URL(request.url);
    const conversationId = url.searchParams.get("conversationId");
    if (conversationId) {
      const conversation = await getConversation(conversationId, userId);
      const messages = conversation?.messages || [];
      return Response.json({ messages }, { status: 200 });
    } else {
      const conversations = await getConversationsForUser(userId);
      return Response.json({ conversations }, { status: 200 });
    }
    } catch (error) {
    console.error("🔥 FULL CONVERSATION ERROR:", error);

    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

