import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, message } = await req.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    /* ================= GET PROJECT TYPE ================= */

    const { getConversation, updateConversationTitle } =
      await import("@/lib/mongodb");

    const conversation = await getConversation(conversationId, userId);

    const projectType = conversation?.projectType || "General";

    /* ================= ENGINEERING PROMPT ================= */

    const titlePrompt = `
You are an expert engineering assistant.

Generate a SHORT (max 5 words) professional conversation title.

Context:
Project Type: ${projectType}

User Message:
"${message}"

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

    await updateConversationTitle(conversationId, userId, title);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Generate title error:", error);

    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}