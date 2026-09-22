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

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    {
      error: "Invalid request body",
    },
    {
      status: 400,
    }
  );
}

const { partnerId } = body as {
  partnerId?: unknown;
};

if (typeof partnerId !== "string") {
  return NextResponse.json(
    {
      error: "Partner ID is required",
    },
    {
      status: 400,
    }
  );
}

const cleanPartnerId =
  partnerId.trim();

if (
  cleanPartnerId.length === 0 ||
  cleanPartnerId.length > 100
) {
  return NextResponse.json(
    {
      error: "Invalid partner ID",
    },
    {
      status: 400,
    }
  );
}

if (!ObjectId.isValid(cleanPartnerId)) {
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
  generatePartnerApiKey("am_test_");

const testApiKeyHash =
  hashPartnerApiKey(testApiKey);

    const result =
      await db
        .collection("partners")
        .updateOne(
          {
            _id: new ObjectId(cleanPartnerId),
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