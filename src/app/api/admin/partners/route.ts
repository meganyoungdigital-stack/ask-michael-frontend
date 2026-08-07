import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";



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


    console.error(
      "Admin partners fetch error:",
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

export async function PATCH(req: Request) {

  try {
    const {
      id,
      status,
    } = await req.json();



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



    const application =
      await db
        .collection("partner_applications")
        .findOne({
          _id: new ObjectId(id),
        });



    if (!application) {

      return NextResponse.json(
        {
          error: "Partner application not found",
        },
        {
          status: 404,
        }
      );

    }




    // Update application status

    await db
      .collection("partner_applications")
      .updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );






    // Create partner account when approved

    if (status === "approved") {



      const existingPartner =
        await db
          .collection("partners")
          .findOne({
            email: application.email,
          });



      if (!existingPartner) {



        const temporaryPassword =
          randomBytes(6)
            .toString("hex");



        const passwordHash =
          await bcrypt.hash(
            temporaryPassword,
            10
          );



        const apiKey =
          "am_live_" +
          randomBytes(24)
            .toString("hex");





        await db
          .collection("partners")
          .insertOne({

            companyName:
              application.companyName,


            contactName:
              application.contactName,


            email:
              application.email,


            passwordHash,


            apiKey,


            status:
              "approved",


            monthlyFee:
              1999,


            pricePerMessage:
              0.05,


            messages:
              0,


            createdAt:
              new Date(),

          });




        console.log(
          "NEW PARTNER ACCOUNT CREATED"
        );


        console.log(
          "Temporary Password:",
          temporaryPassword
        );


        console.log(
          "API Key:",
          apiKey
        );


      }

    }




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