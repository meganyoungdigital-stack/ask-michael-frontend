import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const token = req.headers.get("Authorization");

    if (!token) {
      return NextResponse.json(
        {
          error: "Missing token",
        },
        {
          status: 400,
        }
      );
    }

    if (!ObjectId.isValid(token)) {
      return NextResponse.json(
        {
          error: "Invalid partner token",
        },
        {
          status: 400,
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

    const { db } = await connectToDatabase();

    const partner = await db.collection("partners").findOne({
      _id: new ObjectId(token),
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