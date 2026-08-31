import { NextResponse } from "next/server";
import OpenAI from "openai";

import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // ==========================================
    // GET LIVE PARTNER API KEY
    // ==========================================

    const authorization =
      req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        {
          error: "Missing API key",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // REMOVE BEARER PREFIX IF SUPPLIED
    // ==========================================

    const cleanApiKey =
      authorization.startsWith("Bearer ")
        ? authorization.substring(7)
        : authorization;

    // ==========================================
    // CONNECT TO DATABASE
    // ==========================================

    const { db } =
      await connectToDatabase();

    // ==========================================
    // FIND PARTNER USING LIVE API KEY
    // ==========================================

    const partner =
      await db
        .collection("partners")
        .findOne({
          apiKey: cleanApiKey,
        });

    if (!partner) {
      return NextResponse.json(
        {
          error: "Invalid API key",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // CHECK PARTNER ACCOUNT STATUS
    // ==========================================

    if (
      partner.status !== "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Partner account is not active.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // CHECK SUBSCRIPTION STATUS
    // ==========================================

    if (
      partner.subscriptionStatus !==
      "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Partner subscription is not active.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // READ REQUEST BODY
    // ==========================================

    let body: {
      message?: string;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
        },
        {
          status: 400,
        }
      );
    }

    const message =
      body?.message?.trim();

    if (!message) {
      return NextResponse.json(
        {
          error:
            "A message is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CHECK MAXIMUM MESSAGE LIMIT
    // ==========================================

    const currentMessages =
      Number(partner.messages) || 0;

    const maxMessages =
      Number(partner.maxMessages);

    if (
      Number.isFinite(maxMessages) &&
      maxMessages > 0 &&
      currentMessages >= maxMessages
    ) {
      return NextResponse.json(
        {
          error:
            "Partner message limit has been reached.",
          messages: currentMessages,
          maxMessages,
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // SEND MESSAGE TO OPENAI
    // ==========================================

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content:
              "You are Ask Michael AI, an expert engineering assistant for aluminium smelting and heavy metal engineering. Provide clear, professional and useful engineering information.",
          },
          {
            role: "user",
            content: message,
          },
        ],

        max_tokens: 1200,
      });

    const response =
      completion.choices?.[0]?.message
        ?.content ||
      "No response generated.";

    // ==========================================
    // INCREMENT PARTNER MESSAGE COUNT
    // ==========================================

    const usageResult =
      await db
        .collection("partners")
        .findOneAndUpdate(
          {
            _id: partner._id,
          },
          {
            $inc: {
              messages: 1,
            },
            $set: {
              updatedAt: new Date(),
            },
          },
          {
            returnDocument: "after",
          }
        );

    const updatedMessages =
      Number(
        usageResult?.messages
      ) || currentMessages + 1;

      // ==========================================
// CALCULATE NEW EXTRA USAGE
// ==========================================

const includedMessages =
  Number(
    partner.includedMessages
  ) || 0;

const billedExtraMessages =
  Number(
    partner.billedExtraMessages
  ) || 0;

const totalExtraMessages =
  Math.max(
    0,
    updatedMessages -
      includedMessages
  );

const newExtraMessages =
  Math.max(
    0,
    totalExtraMessages -
      billedExtraMessages
  );

  // ==========================================
// CHARGE NEW EXTRA USAGE
// ==========================================

if (newExtraMessages > 0) {
  try {
    const chargeResponse =
      await fetch(
        new URL(
          "/api/partner/payments/charge-extra-usage",
          req.url
        ),
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${cleanApiKey}`,
            "Content-Type":
              "application/json",
          },
        }
      );

    const chargeData =
      await chargeResponse.json();

    console.log(
      "PARTNER EXTRA USAGE CHARGE RESULT:",
      chargeData
    );

    if (!chargeResponse.ok) {
      console.error(
        "PARTNER EXTRA USAGE CHARGE FAILED:",
        chargeData
      );
    }
  } catch (chargeError) {
    console.error(
      "PARTNER EXTRA USAGE CHARGE ERROR:",
      chargeError
    );
  }
}

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json({
      success: true,

      test: false,

      partner: {
        companyName:
          partner.companyName,
      },

      response,

      usage: {
  messages:
    updatedMessages,

  includedMessages:
    partner.includedMessages,

  billedExtraMessages,

  extraMessages:
    totalExtraMessages,

  newExtraMessages,
},
    });
  } catch (error) {
    console.error(
      "PARTNER LIVE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Live partner API request failed.",
      },
      {
        status: 500,
      }
    );
  }
}

