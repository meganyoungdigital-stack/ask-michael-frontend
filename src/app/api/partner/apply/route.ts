import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Resend } from "resend";


const resend = new Resend(
  process.env.RESEND_API_KEY
);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
  typeof companyName !== "string" ||
  typeof contactName !== "string" ||
  typeof email !== "string" ||
  typeof message !== "string" ||
  (website !== undefined && typeof website !== "string")
) {
  return NextResponse.json(
    {
      error: "Invalid request fields",
    },
    {
      status: 400,
    }
  );
}

const cleanCompanyName = companyName.trim();
const cleanContactName = contactName.trim();
const cleanEmail = email.trim();
const cleanWebsite = website?.trim() || "";
const cleanMessage = message.trim();

const safeCompanyName = escapeHtml(cleanCompanyName);
const safeContactName = escapeHtml(cleanContactName);
const safeEmail = escapeHtml(cleanEmail);
const safeWebsite = escapeHtml(cleanWebsite);
const safeMessage = escapeHtml(cleanMessage);

if (
  cleanCompanyName.length === 0 ||
  cleanContactName.length === 0 ||
  cleanEmail.length === 0 ||
  cleanMessage.length === 0
) {
  return NextResponse.json(
    {
      error: "Required fields cannot be empty",
    },
    {
      status: 400,
    }
  );
}

if (
  cleanCompanyName.length > 200 ||
  cleanContactName.length > 200 ||
  cleanEmail.length > 320 ||
  cleanWebsite.length > 500 ||
  cleanMessage.length > 5000
) {
  return NextResponse.json(
    {
      error: "One or more fields exceed the maximum allowed length",
    },
    {
      status: 400,
    }
  );
}




    const { db } = await connectToDatabase();



    await db.collection("partner_applications").insertOne({

      companyName: cleanCompanyName,

      contactName: cleanContactName,

      email: cleanEmail,

      website: cleanWebsite,

      message: cleanMessage,

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
          ${safeCompanyName}
        </p>


        <p>
          <strong>Contact Name:</strong>
          ${safeContactName}
        </p>


        <p>
          <strong>Email:</strong>
          ${safeEmail}
        </p>


        <p>
          <strong>Website:</strong>
          ${safeWebsite || "Not provided"}
        </p>


        <p>
          <strong>Message:</strong>
        </p>


        <p>
          ${safeMessage}
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