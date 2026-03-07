import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import Document from "@/models/Document";

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

export async function GET() {
  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const documents = await Document.find({ userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ documents });

  } catch (error) {

    return NextResponse.json(
      { error: "Failed to load documents" },
      { status: 500 }
    );
  }
}