import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

import { connectToDatabase } from "@/lib/mongodb";
import {
  SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";

export async function POST() {
  try {
    /*
     * Verify admin session
     */

    const cookieStore = await cookies();

    const session =
      cookieStore.get(
        SESSION_COOKIE
      )?.value;

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

    /*
     * Connect to database
     */

    const { db } =
      await connectToDatabase();

    /*
     * Find partners that do not
     * have a test API key yet.
     */

    const partners =
      await db
        .collection("partners")
        .find({
          $or: [
            {
              testApiKey: {
                $exists: false,
              },
            },
            {
              testApiKey: null,
            },
            {
              testApiKey: "",
            },
          ],
        })
        .toArray();

    let generated = 0;

    /*
     * Generate a unique test API key
     * for each existing partner.
     */

    for (const partner of partners) {
      let testApiKey = "";

      do {
        testApiKey =
          "am_test_" +
          crypto
            .randomBytes(24)
            .toString("hex");

        const existingKey =
          await db
            .collection("partners")
            .findOne({
              testApiKey,
            });

        if (!existingKey) {
          break;
        }
      } while (true);

      await db
        .collection("partners")
        .updateOne(
          {
            _id: partner._id,
          },
          {
            $set: {
              testApiKey,
            },
          }
        );

      generated++;
    }

    return NextResponse.json({
      success: true,
      generated,
      message:
        generated === 0
          ? "All partners already have test API keys."
          : `Generated ${generated} test API key(s).`,
    });
  } catch (error) {
    console.error(
      "Generate test API keys error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed generating test API keys",
      },
      {
        status: 500,
      }
    );
  }
}