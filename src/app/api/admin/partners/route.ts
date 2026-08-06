import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";


export async function GET() {

  try {

    const { db } = await connectToDatabase();


    const applications = await db
      .collection("partner_applications")
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();



    return NextResponse.json(
      applications
    );


  } catch (error) {

  console.error("Admin partners fetch error:", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    },
    {
      status: 500,
    }
  );

}

}