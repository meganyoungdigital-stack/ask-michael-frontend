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

    const body = await req.json();

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

const {
  partnerId,
  billingPeriod,
  dueDate,
} = body as {
  partnerId?: unknown;
  billingPeriod?: unknown;
  dueDate?: unknown;
};

if (
  typeof partnerId !== "string" ||
  typeof billingPeriod !== "string" ||
  (dueDate !== undefined && dueDate !== null && typeof dueDate !== "string")
) {
  return NextResponse.json(
    {
      error: "Invalid invoice details",
    },
    {
      status: 400,
    }
  );
}

const cleanPartnerId = partnerId.trim();
const cleanBillingPeriod = billingPeriod.trim();
const cleanDueDate =
  typeof dueDate === "string"
    ? dueDate.trim()
    : "";

if (
  cleanPartnerId.length === 0 ||
  cleanBillingPeriod.length === 0
) {
  return NextResponse.json(
    {
      error: "Missing required invoice details",
    },
    {
      status: 400,
    }
  );
}

if (
  cleanPartnerId.length > 100 ||
  cleanBillingPeriod.length > 100 ||
  cleanDueDate.length > 100
) {
  return NextResponse.json(
    {
      error: "Invoice details exceed the maximum allowed length",
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

const partner =
  await db.collection("partners").findOne({
    _id: new ObjectId(cleanPartnerId),
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
  partnerId: cleanPartnerId,
companyName: partner.companyName || "",
contactName: partner.contactName || "",
email: partner.email || "",
billingPeriod: cleanBillingPeriod,
  messages: billing.messagesUsed,
  pricePerMessage: billing.pricePerMessage,
  monthlyFee: billing.monthlyFee,
  usageAmount: billing.extraUsageCharge,
  totalAmount: billing.totalBill,
  paymentStatus: "unpaid",
  dueDate: cleanDueDate || null,
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