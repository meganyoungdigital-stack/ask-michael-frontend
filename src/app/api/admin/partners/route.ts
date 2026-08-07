import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";



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

    console.log("PATCH CALLED");
console.log("Status:", status);
console.log("ID:", id);




    if (!id || !status) {


      return NextResponse.json(
        {
          error: "Missing id or status",
        },
        {
          status:400,
        }
      );


    }




    const { db } = await connectToDatabase();





    const application =
      await db
        .collection("partner_applications")
        .findOne({

          _id:
            new ObjectId(id),

        });
       console.log("Application found:", application);





    if (!application) {


      return NextResponse.json(
        {
          error:"Partner application not found",
        },
        {
          status:404,
        }
      );


    }





    // Update application status

    await db
      .collection("partner_applications")
      .updateOne(

        {
          _id:
            new ObjectId(id),
        },

        {
          $set:
          {
            status,

            updatedAt:
              new Date(),
          }
        }

      );








    // Create registration invitation after approval
    console.log("Checking approval status:", status);
    if(status === "approved"){

     console.log("APPROVAL BLOCK ENTERED");


      const existingInvitation =
        await db
          .collection("partner_invitations")
          .findOne({

            email:
              application.email,

          });






      if(!existingInvitation){



        const token =
          crypto.randomUUID();




console.log("Creating invitation...");

        await db
  .collection("partner_invitations")
  .insertOne({

    companyName:
      application.companyName,

    contactName:
      application.contactName,

    email:
      application.email,

    token,

    status:
      "pending",

    createdAt:
      new Date(),

  });


console.log(
  "Invitation created successfully"
);







        console.log(
          "=============================="
        );


        console.log(
          "PARTNER REGISTRATION LINK:"
        );


        console.log(
          `https://askmichaelai.org/partner-register/${token}`
        );


        console.log(
          "=============================="
        );



      }


    }







    return NextResponse.json(
      {
        success:true,
        status,
      }
    );





  } catch(error) {



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
        status:500,
      }
    );



  }


}