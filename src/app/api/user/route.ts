import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";

/* =========================
GET USER
========================= */

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({ userId });

    return NextResponse.json({
      tier: user?.tier || "free",
      subscriptionStatus: user?.subscriptionStatus || "inactive",
      company: user?.company || "",
      name: user?.name || "",
      email: user?.email || "",
      occupation: user?.occupation || "", // ✅ NEW
    });

  } catch (error) {
    console.error("User API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/* =========================
UPDATE USER
========================= */

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    { error: "Invalid request body" },
    { status: 400 }
  );
}

const {
  name,
  company,
  email,
  occupation,
} = body as {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  occupation?: unknown;
};

if (
  name !== undefined && typeof name !== "string"
) {
  return NextResponse.json(
    { error: "Invalid name" },
    { status: 400 }
  );
}

if (
  company !== undefined && typeof company !== "string"
) {
  return NextResponse.json(
    { error: "Invalid company" },
    { status: 400 }
  );
}

if (
  email !== undefined && typeof email !== "string"
) {
  return NextResponse.json(
    { error: "Invalid email" },
    { status: 400 }
  );
}

if (
  occupation !== undefined && typeof occupation !== "string"
) {
  return NextResponse.json(
    { error: "Invalid occupation" },
    { status: 400 }
  );
}

const cleanName = name?.trim();
const cleanCompany = company?.trim();
const cleanEmail = email?.trim();
const cleanOccupation = occupation?.trim();

if (
  cleanName !== undefined &&
  cleanName.length > 200
) {
  return NextResponse.json(
    { error: "Name exceeds the maximum allowed length" },
    { status: 400 }
  );
}

if (
  cleanCompany !== undefined &&
  cleanCompany.length > 200
) {
  return NextResponse.json(
    { error: "Company exceeds the maximum allowed length" },
    { status: 400 }
  );
}

if (
  cleanEmail !== undefined &&
  cleanEmail.length > 320
) {
  return NextResponse.json(
    { error: "Email exceeds the maximum allowed length" },
    { status: 400 }
  );
}

if (
  cleanOccupation !== undefined &&
  cleanOccupation.length > 200
) {
  return NextResponse.json(
    { error: "Occupation exceeds the maximum allowed length" },
    { status: 400 }
  );
}

    const { db } = await connectToDatabase();

    /* =========================
       SAFE UPDATE OBJECT
    ========================= */

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (cleanName !== undefined) {
  updateData.name = cleanName;
}

if (cleanCompany !== undefined) {
  updateData.company = cleanCompany;
}

if (cleanEmail !== undefined) {
  updateData.email = cleanEmail;
}

if (cleanOccupation !== undefined) {
  updateData.occupation = cleanOccupation;
}

    /* =========================
       UPSERT USER
    ========================= */

    await db.collection("users").updateOne(
      { userId },
      {
        $set: updateData,
        $setOnInsert: {
          userId,
          tier: "free",
          subscriptionStatus: "inactive",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("User UPDATE error:", error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}