import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    { error: "Invalid request body" },
    { status: 400 }
  );
}

const {
  conversationId,
  message,
} = body as {
  conversationId?: unknown;
  message?: unknown;
};

if (
  typeof conversationId !== "string" ||
  typeof message !== "string"
) {
  return NextResponse.json(
    { error: "Invalid conversation data" },
    { status: 400 }
  );
}

const cleanConversationId = conversationId.trim();
const cleanMessage = message.trim();

if (
  cleanConversationId.length === 0 ||
  cleanMessage.length === 0
) {
  return NextResponse.json(
    { error: "Conversation ID and message are required" },
    { status: 400 }
  );
}

if (
  cleanConversationId.length > 200 ||
  cleanMessage.length > 20000
) {
  return NextResponse.json(
    { error: "Conversation data exceeds the maximum allowed length" },
    { status: 400 }
  );
}

    /* ================= GET PROJECT TYPE ================= */

    const { getConversation, updateConversationTitle } =
      await import("@/lib/mongodb");

    const conversation = await getConversation(
  cleanConversationId,
  userId
);

const projectType = conversation?.projectType || "General";

    /* ================= ENGINEERING PROMPT ================= */

    const titlePrompt = `
You are an expert engineering assistant.

Generate a SHORT (max 5 words) professional conversation title.

Context:
Project Type: ${projectType}

User Message:
"${cleanMessage}"

Rules:
- Use engineering terminology where appropriate
- Be specific (e.g. "Beam Load Calc", "Welding Procedure Spec")
- No quotes
- No punctuation at the end
- Max 5 words
- Make it sound like an engineering task or document title

Examples:
- RC Beam Load Design
- Steel Connection Check
- ISO 3834 Weld Compliance
- Foundation Bearing Capacity
- HVAC Load Calculation
`;

    /* ================= OPENAI CALL ================= */

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: titlePrompt }],
        temperature: 0.2,
      }),
    });

    const openaiData = await openaiRes.json();

    let title =
      openaiData?.choices?.[0]?.message?.content?.trim() ||
      "New Chat";

    /* ================= CLEAN TITLE ================= */

    title = title
      .replace(/[".]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    /* ================= SAVE ================= */

    await updateConversationTitle(
  cleanConversationId,
  userId,
  title
);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Generate title error:", error);

    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}