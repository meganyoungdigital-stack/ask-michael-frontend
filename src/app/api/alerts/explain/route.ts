import { NextResponse } from "next/server";
import OpenAI from "openai";

/* ✅ IMPORT YOUR RAG SYSTEM */
import { buildDocumentContext } from "@/lib/vectorSearch";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
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
  temperature,
  pressure,
  vibration,
} = body as {
  temperature?: unknown;
  pressure?: unknown;
  vibration?: unknown;
};

if (
  typeof temperature !== "number" ||
  !Number.isFinite(temperature) ||
  typeof pressure !== "number" ||
  !Number.isFinite(pressure) ||
  typeof vibration !== "number" ||
  !Number.isFinite(vibration)
) {
  return NextResponse.json(
    { error: "Invalid sensor data" },
    { status: 400 }
  );
}

const { userId } = await auth();

if (!userId) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const cleanUserId = userId;

    /* ============================
       📚 GET DOCUMENT CONTEXT (RAG)
    ============================ */

    let documentContext = "";

    try {
      if (cleanUserId) {
        const query = `
Industrial sensor anomaly:
Temperature: ${temperature}
Pressure: ${pressure}
Vibration: ${vibration}

Find relevant engineering procedures, manuals, or specifications.
`;

        documentContext = await buildDocumentContext(
          query,
          cleanUserId
        );
      }
    } catch {
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
  } catch {

    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}