import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { calculatePartnerBilling } from "@/lib/partnerBilling";
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
  billingPeriod,
  dueDate,
} = body;


    if (!partnerId || !billingPeriod) {
  return NextResponse.json(
    {
      error: "Missing required invoice details",
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

const invoiceNumber =
  `INV-${Date.now()}`;


  const billing = calculatePartnerBilling({
  messages: partner.messages,
  includedMessages: partner.includedMessages,
  billedExtraMessages: partner.billedExtraMessages,
  pricePerMessage: partner.pricePerMessage,
  monthlyFee: partner.monthlyFee,
});

const invoice = {
  invoiceNumber,
  partnerId,
  companyName: partner.companyName || "",
  contactName: partner.contactName || "",
  email: partner.email || "",
  billingPeriod,
  messages: billing.messagesUsed,
  pricePerMessage: billing.pricePerMessage,
  monthlyFee: billing.monthlyFee,
  usageAmount: billing.extraUsageCharge,
  totalAmount: billing.totalBill,
  paymentStatus: "unpaid",
  dueDate: dueDate || null,
  createdAt: new Date(),
  createdBy: adminId,
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