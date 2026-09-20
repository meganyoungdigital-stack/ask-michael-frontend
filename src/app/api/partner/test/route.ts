import { NextResponse } from "next/server";
import OpenAI from "openai";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPartnerApiKey } from "@/lib/partnerApiKeys";
import { partnerRatelimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    /*
     * Get API key
     */

    const apiKey =
      req.headers.get("Authorization");

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Missing API key",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Remove Bearer prefix if supplied
     */

    const cleanApiKey =
      apiKey.startsWith("Bearer ")
        ? apiKey.substring(7)
        : apiKey;

        const apiKeyHash =
  hashPartnerApiKey(cleanApiKey);

    /*
     * Find partner
     */

    const { db } =
      await connectToDatabase();

    const partner =
  await db
    .collection("partners")
    .findOne({
      testApiKeyHash: apiKeyHash,
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

const rateLimitResult =
  await partnerRatelimit.limit(
    partner._id.toString()
  );

if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error:
        "Too many requests. Please try again later.",
    },
    {
      status: 429,
    }
  );
}

    /*
     * Test API request
     */

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
            "A message is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Send request to OpenAI
     *
     * This is TEST API usage.
     * It does NOT:
     * - increase partner.messages
     * - create an invoice
     * - start billing
     * - activate the account
     */

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

    return NextResponse.json({
      success: true,

      test: true,

      partner: {
        companyName:
          partner.companyName,
      },

      response,
    });
  } catch (error) {
    console.error(
      "PARTNER_TEST_API_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Test API request failed",
      },
      {
        status: 500,
      }
    );
  }
}