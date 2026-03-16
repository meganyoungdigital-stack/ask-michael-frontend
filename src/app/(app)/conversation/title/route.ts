import { NextResponse } from "next/server";
import OpenAI from "openai";
import { updateConversationTitle } from "@/lib/mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { conversationId, message } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Generate a very short 3-5 word conversation title.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    max_tokens: 12,
  });

  const title =
    completion.choices[0].message.content || "New Conversation";

  await updateConversationTitle(conversationId, "", title);

  return NextResponse.json({ title });
}