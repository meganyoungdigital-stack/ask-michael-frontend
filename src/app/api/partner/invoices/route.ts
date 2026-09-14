import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import {
  PARTNER_SESSION_COOKIE,
  verifyPartnerSession,
} from "@/lib/partnerAuth";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();

const session =
  cookieStore.get(
    PARTNER_SESSION_COOKIE
  )?.value;

const partnerId =
  verifyPartnerSession(session);

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

const partner =
  await db.collection("partners").findOne({
    _id: new ObjectId(partnerId),
  });

    if (!partner) {
      return NextResponse.json(
        {
          error: "Partner not found",
        },
        {
          status: 404,
        }
      );
    }

    const invoices = await db
      .collection("invoices")
      .find({
        partnerId: partner._id.toString(),
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Partner invoices error:", error);

    return NextResponse.json(
      {
        error: "Failed loading invoices",
      },
      {
        status: 500,
      }
    );
  }
}