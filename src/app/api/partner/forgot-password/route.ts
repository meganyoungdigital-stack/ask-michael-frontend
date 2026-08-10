import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";
import { Resend } from "resend";


const resend = new Resend(
  process.env.RESEND_API_KEY
);



export async function POST(req: Request) {


  try {


    const { email } = await req.json();



    if (!email) {

      return NextResponse.json(
        {
          error: "Email is required",
        },
        {
          status: 400,
        }
      );

    }



    const { db } = await connectToDatabase();



    const partner = await db
      .collection("partners")
      .findOne({
        email,
      });



    /*
      Security:
      We do not reveal whether an email exists.
    */

    if (!partner) {

      return NextResponse.json({
        success: true,
      });

    }



    const resetToken =
      crypto.randomBytes(32)
      .toString("hex");



    const resetTokenExpiry =
      new Date(
        Date.now() + 60 * 60 * 1000
      );



    await db
      .collection("partners")
      .updateOne(

        {
          email,
        },

        {
          $set:
          {
            resetToken,

            resetTokenExpiry,
          }
        }

      );




    const resetLink =
      `https://askmichaelai.org/partner-reset-password/${resetToken}`;





    await resend.emails.send({

      from:
        "askmichael@askmichaelai.org",

      to:
        email,

      subject:
        "Ask Michael AI Partner Password Reset",

      html:
      `
      <h2>Password Reset Request</h2>

      <p>
      You requested a password reset for your Ask Michael AI partner account.
      </p>


      <p>
      Click the link below to create a new password:
      </p>


      <a href="${resetLink}">
        Reset Password
      </a>


      <p>
      This link expires in 1 hour.
      </p>
      `

    });





    return NextResponse.json({

      success:true,

    });




  } catch(error) {


    console.error(
      "Partner forgot password error:",
      error
    );


    return NextResponse.json(

      {
        error:
          "Password reset failed",
      },

      {
        status:500,
      }

    );


  }


}