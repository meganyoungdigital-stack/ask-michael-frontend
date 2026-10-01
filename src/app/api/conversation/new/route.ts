import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

/* ================= POST ================= */

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
      Create a new conversation ID.
      The conversation is created only when
      the first message is saved.
    */

    const conversationId = randomUUID();

    return NextResponse.json(
      {
        success: true,
        conversationId,
      },
      {
        status: 200,
      }
    );

  } catch {

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }
}
