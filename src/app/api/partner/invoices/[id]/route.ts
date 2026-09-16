import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import {
  PARTNER_SESSION_COOKIE,
  verifyPartnerSession,
} from "@/lib/partnerAuth";
import { ObjectId } from "mongodb";

export async function GET(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

const { id } = await context.params;

if (!ObjectId.isValid(id)) {
  return NextResponse.json(
    {
      error: "Invalid invoice ID",
    },
    {
      status: 400,
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

    const invoice = await db
      .collection("invoices")
      .findOne({
        _id: new ObjectId(id),
        partnerId: partner._id.toString(),
      });

    if (!invoice) {
      return NextResponse.json(
        {
          error: "Invoice not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(
      "Partner single invoice error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed loading invoice",
      },
      {
        status: 500,
      }
    );
  }
}