import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
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