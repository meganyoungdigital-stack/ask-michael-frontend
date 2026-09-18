import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
import {
  generatePartnerApiKey,
  hashPartnerApiKey,
} from "@/lib/partnerApiKeys";
import {
  SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";

export async function POST(
  request: Request
) {
  try {
    const cookieStore = await cookies();

    const session =
      cookieStore.get(SESSION_COOKIE)?.value;

    const adminId =
      verifyAdminSession(session);

    if (!adminId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const { partnerId } = body;

    if (!partnerId) {
      return NextResponse.json(
        {
          error: "Partner ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!ObjectId.isValid(partnerId)) {
      return NextResponse.json(
        {
          error: "Invalid partner ID",
        },
        {
          status: 400,
        }
      );
    }

    const { db } =
      await connectToDatabase();

    const apiKey =
      generatePartnerApiKey("am_live_");

    const apiKeyHash =
      hashPartnerApiKey(apiKey);

    const result =
      await db
        .collection("partners")
        .updateOne(
          {
            _id: new ObjectId(partnerId),
          },
          {
            $set: {
              apiKeyHash,
            },
            $unset: {
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
      apiKey,
    });

  } catch (error) {

    console.error(
      "Generate live API key error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed generating live API key",
      },
      {
        status: 500,
      }
    );
  }
}