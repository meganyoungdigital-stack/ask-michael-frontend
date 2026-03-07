import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import Document from "@/models/Document";

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST(req: Request) {
  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const newDoc = await Document.create({
      userId,
      name: file.name,
      url: "",
    });

    return NextResponse.json({
      success: true,
      document: newDoc,
    });

  } catch (error) {

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}