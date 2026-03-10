import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import Document from "@/models/Document";

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

/* GET DOCUMENTS */

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const documents = await Document.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ documents });

  } catch {
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

/* DELETE DOCUMENT */

export async function DELETE(req: Request) {

  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await Document.deleteOne({ _id: id, userId });

    return NextResponse.json({ success: true });

  } catch {

    return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  }
}