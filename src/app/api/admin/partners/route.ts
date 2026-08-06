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




export async function PATCH(req: Request) {

  try {

    const body = await req.json();


    const {
      id,
      status,
    } = body;



    if (!id || !status) {

      return NextResponse.json(
        {
          error: "Missing id or status",
        },
        {
          status: 400,
        }
      );

    }



    const { db } = await connectToDatabase();



    await db
      .collection("partner_applications")
      .updateOne(
        {
          _id: new (await import("mongodb")).ObjectId(id),
        },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );



    return NextResponse.json(
      {
        success: true,
        status,
      }
    );


  } catch (error) {

    console.error(
      "Partner status update error:",
      error
    );


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