import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

/* ================= POST ================= */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ================= CREATE ID ONLY (NO DB WRITE) ================= */
    const conversationId = randomUUID();

    // ❌ DO NOT create conversation here anymore
    // It will be created on FIRST MESSAGE inside chat route

    return NextResponse.json({ conversationId });

  } catch (error) {
    console.error("NEW CONVERSATION ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}