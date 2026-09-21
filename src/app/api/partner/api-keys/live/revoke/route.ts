import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
import {
  PARTNER_SESSION_COOKIE,
  verifyPartnerSession,
} from "@/lib/partnerAuth";
import { partnerRatelimit } from "@/lib/ratelimit";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const session =
      cookieStore.get(
        PARTNER_SESSION_COOKIE
      )?.value;

    const partnerId =
      await verifyPartnerSession(session);

    if (!partnerId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!ObjectId.isValid(partnerId)) {
      return NextResponse.json(
        {
          error: "Invalid partner session",
        },
        {
          status: 401,
        }
      );
    }

const rateLimitResult =
  await partnerRatelimit.limit(
    partnerId
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

    const { db } =
      await connectToDatabase();

    const result =
      await db
        .collection("partners")
        .updateOne(
          {
            _id: new ObjectId(partnerId),
          },
          {
            $unset: {
              apiKeyHash: "",
              apiKey: "",
            },
          }
        );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: "Partner not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Partner live API key revoke error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed revoking live API key",
      },
      {
        status: 500,
      }
    );
  }
}