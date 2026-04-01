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

    const {
      name,
      company,
      email,
      occupation, // ✅ NEW
    } = body;

    const { db } = await connectToDatabase();

    /* =========================
       SAFE UPDATE OBJECT
    ========================= */

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (email !== undefined) updateData.email = email;
    if (occupation !== undefined) updateData.occupation = occupation; // ✅ NEW

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