import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import {
  SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";


async function requireAdmin() {

  const cookieStore = await cookies();

  const session =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  const adminId =
    verifyAdminSession(session);

  if (!adminId) {
    return null;
  }

  return adminId;
}


export async function GET() {

  const adminId =
    await requireAdmin();

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


  try {

    const { db } =
      await connectToDatabase();


    const invoices =
      await db
        .collection("invoices")
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();


    return NextResponse.json(
      invoices
    );


  } catch (error) {

    console.error(
      "Admin invoices error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Failed loading invoices",
      },
      {
        status: 500,
      }
    );

  }

}
export async function POST(req: Request) {

  const adminId =
    await requireAdmin();

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

  try {

    const body =
      await req.json();

    const {
      partnerId,
      companyName,
      contactName,
      email,
      billingPeriod,
      messages,
      pricePerMessage,
      monthlyFee,
      usageAmount,
      totalAmount,
      dueDate,
    } = body;


    if (
      !partnerId ||
      !companyName ||
      !email ||
      !billingPeriod
    ) {

      return NextResponse.json(
        {
          error:
            "Missing required invoice details",
        },
        {
          status: 400,
        }
      );

    }


    const { db } =
      await connectToDatabase();


    const invoiceNumber =
      `INV-${Date.now()}`;


    const invoice = {

      invoiceNumber,

      partnerId,

      companyName,

      contactName:
        contactName || "",

      email,

      billingPeriod,

      messages:
        Number(messages) || 0,

      pricePerMessage:
        Number(pricePerMessage) || 0,

      monthlyFee:
        Number(monthlyFee) || 0,

      usageAmount:
        Number(usageAmount) || 0,

      totalAmount:
        Number(totalAmount) || 0,

      paymentStatus:
        "unpaid",

      dueDate:
        dueDate || null,

      createdAt:
        new Date(),

      createdBy:
        adminId,

    };


    const result =
      await db
        .collection("invoices")
        .insertOne(invoice);


    return NextResponse.json(
      {
        success: true,

        invoice: {
          ...invoice,
          _id:
            result.insertedId,
        },
      }
    );


  } catch (error) {

    console.error(
      "Admin invoice creation error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Failed creating invoice",
      },
      {
        status: 500,
      }
    );

  }

}