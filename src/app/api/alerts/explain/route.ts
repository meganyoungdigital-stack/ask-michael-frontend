import { NextResponse } from "next/server";
import OpenAI from "openai";

/* ✅ IMPORT YOUR RAG SYSTEM */
import { buildDocumentContext } from "@/lib/vectorSearch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      temperature,
      pressure,
      vibration,
      userId, // 👈 IMPORTANT for RAG
    } = body;

    /* ============================
       📚 GET DOCUMENT CONTEXT (RAG)
    ============================ */

    let documentContext = "";

    try {
      if (userId) {
        const query = `
Industrial sensor anomaly:
Temperature: ${temperature}
Pressure: ${pressure}
Vibration: ${vibration}

Find relevant engineering procedures, manuals, or specifications.
`;

        documentContext = await buildDocumentContext(
          query,
          userId
        );
      }
    } catch (err) {
      console.error("RAG context error:", err);
    }

    /* ============================
       🧠 BUILD AI PROMPT
    ============================ */

    const prompt = `
You are an expert industrial engineer.

Analyze the sensor data and explain:

1. What is happening
2. Possible root cause
3. Risk level
4. Recommended action

IF document context is provided:
- Use it as primary reference
- Cite sources like [Source 1]

Sensor Data:
Temperature: ${temperature}
Pressure: ${pressure}
Vibration: ${vibration}

DOCUMENT CONTEXT:
${documentContext || "No relevant documents found."}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional engineering AI that uses documents when available.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    const result =
      completion.choices[0].message.content;

    return NextResponse.json({
      result,
      usedRAG: !!documentContext,
    });
  } catch (err) {
    console.error("AI explain error:", err);

    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}