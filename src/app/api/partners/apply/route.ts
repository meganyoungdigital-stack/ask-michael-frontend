import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Resend } from "resend";


const resend = new Resend(
  process.env.RESEND_API_KEY
);



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






    const { data, error } = await resend.emails.send({

      from: "Ask Michael AI <noreply@askmichaelai.org>",

      to: [
        "askmichael@askmichaelai.org"
      ],

      subject: "New Partner Application Received",

      html: `

        <h2>
          New Partner Application
        </h2>


        <p>
          <strong>Company:</strong>
          ${companyName}
        </p>


        <p>
          <strong>Contact Name:</strong>
          ${contactName}
        </p>


        <p>
          <strong>Email:</strong>
          ${email}
        </p>


        <p>
          <strong>Website:</strong>
          ${website || "Not provided"}
        </p>


        <p>
          <strong>Message:</strong>
        </p>


        <p>
          ${message}
        </p>


      `,

    });






    if (error) {

      console.error(
        "RESEND ERROR:",
        error
      );


      return NextResponse.json(

        {
          error: "Application saved but email failed",
          resendError: error,
        },

        {
          status: 500,
        }

      );

    }





    console.log(
      "RESEND SUCCESS:",
      data
    );






    return NextResponse.json(

      {
        success: true,

        message: "Application submitted successfully",

        emailId: data?.id,

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