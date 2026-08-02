import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";


export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      companyName,
      contactName,
      email,
      website,
      message,
    } = body;


    if (
      !companyName ||
      !contactName ||
      !email ||
      !message
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }


    const { db } = await connectToDatabase();


    await db.collection("partner_applications").insertOne({

      companyName,

      contactName,

      email,

      website: website || "",

      message,

      status: "pending",

      createdAt: new Date(),

    });


    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Partner application error:",
      error
    );


    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );

  }

}