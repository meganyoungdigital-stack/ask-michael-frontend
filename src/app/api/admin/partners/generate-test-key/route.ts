import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
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

    const testApiKey =
      "am_test_" +
      crypto
        .randomBytes(24)
        .toString("hex");

    const result =
      await db
        .collection("partners")
        .updateOne(
          {
            _id: new ObjectId(partnerId),
          },
          {
            $set: {
              testApiKey,
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
      "Generate test API key error:",
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