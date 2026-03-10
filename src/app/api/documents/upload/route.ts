import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

/* =========================
   GET USER DOCUMENTS
========================= */

export async function GET() {

  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();

    const documents = await db
      .collection("documents")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ documents });

  } catch {

    return NextResponse.json(
      { error: "Failed to load documents" },
      { status: 500 }
    );

  }
}

/* =========================
   UPLOAD DOCUMENT
========================= */

export async function POST(req: NextRequest) {

  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const db = await connectToDatabase();

    await db.collection("documents").insertOne({
      userId,
      name: body.name,
      url: body.url,
      type: body.type || "file",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });

  } catch {

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );

  }
}

/* =========================
   DELETE DOCUMENT
========================= */

export async function DELETE(req: Request) {

  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const db = await connectToDatabase();

    await db.collection("documents").deleteOne({
  _id: new ObjectId(id),
  userId,
});

    return NextResponse.json({ success: true });

  } catch {

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );

  }
}