import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
import {
  PARTNER_SESSION_COOKIE,
  verifyPartnerSession,
} from "@/lib/partnerAuth";
import {
  generatePartnerApiKey,
  hashPartnerApiKey,
} from "@/lib/partnerApiKeys";

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

    const { db } =
      await connectToDatabase();

    const testApiKey =
      generatePartnerApiKey("am_test_");

    const testApiKeyHash =
      hashPartnerApiKey(testApiKey);

    const result =
      await db
        .collection("partners")
        .updateOne(
          {
            _id: new ObjectId(partnerId),
          },
          {
            $set: {
              testApiKeyHash,
            },
            $unset: {
              testApiKey: "",
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
      testApiKey,
    });
  } catch (error) {
    console.error(
      "Partner test API key generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed generating test API key",
      },
      {
        status: 500,
      }
    );
  }
}