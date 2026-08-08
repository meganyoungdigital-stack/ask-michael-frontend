import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);



// GET - Load partner applications

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



// PATCH - Approve / Reject / Suspend partner

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
          status: 400,
        }
      );

    }


    const { db } =
      await connectToDatabase();


    const application =
      await db
        .collection("partner_applications")
        .findOne({
          _id:
            new ObjectId(id),
        });


    console.log(
      "Application found:",
      application
    );


    if (!application) {

      return NextResponse.json(
        {
          error:
            "Partner application not found",
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
          _id:
            new ObjectId(id),
        },

        {
          $set: {
            status,

            updatedAt:
              new Date(),
          },
        }

      );



    // =====================================================
    // APPROVED
    // Create registration invitation and send email
    // =====================================================

    console.log(
      "Checking approval status:",
      status
    );


    if (status === "approved") {

      console.log(
        "APPROVAL BLOCK ENTERED"
      );


      // Look for an existing pending invitation

      const existingInvitation =
        await db
          .collection("partner_invitations")
          .findOne({

            email:
              application.email,

            status:
              "pending",

          });



      let token: string;



      // =================================================
      // CREATE NEW INVITATION
      // =================================================

      if (!existingInvitation) {

        token =
          crypto.randomUUID();


        console.log(
          "Creating invitation..."
        );


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


      } else {

        // =================================================
        // EXISTING INVITATION
        // =================================================

        token =
          existingInvitation.token;


        console.log(
          "Existing pending invitation found."
        );

      }



      // =================================================
      // REGISTRATION LINK
      // =================================================

      const registrationLink =
        `https://askmichaelai.org/partner-register/${token}`;


      console.log(
        "=============================="
      );


      console.log(
        "PARTNER REGISTRATION LINK:"
      );


      console.log(
        registrationLink
      );


      console.log(
        "=============================="
      );



      // =================================================
      // SEND EMAIL USING RESEND
      // =================================================

      console.log(
        "Sending partner invitation email..."
      );


      const emailResult =
        await resend.emails.send({

          from:
            "Ask Michael AI <askmichael@askmichaelai.org>",

          to:
            application.email,

          subject:
            "Your Ask Michael AI Partner Account",

          html: `

            <div
              style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                color: #111827;
              "
            >

              <h1
                style="
                  font-size: 28px;
                  margin-bottom: 24px;
                "
              >
                Welcome to Ask Michael AI
              </h1>


              <p>
                Hello ${application.contactName},
              </p>


              <p>
                Your partner application for
                <strong>
                  ${application.companyName}
                </strong>
                has been approved.
              </p>


              <p>
                You can now create your partner account
                and set your password using the secure
                registration link below.
              </p>


              <p
                style="
                  margin: 32px 0;
                "
              >

                <a
                  href="${registrationLink}"
                  style="
                    display: inline-block;
                    background: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 24px;
                    border-radius: 8px;
                    font-weight: bold;
                  "
                >
                  Create Your Partner Account
                </a>

              </p>


              <p>
                Or copy and paste this link into your
                browser:
              </p>


              <p
                style="
                  word-break: break-all;
                  color: #2563eb;
                "
              >
                ${registrationLink}
              </p>


              <p>
                If you did not expect this invitation,
                please contact Ask Michael AI.
              </p>


              <p
                style="
                  margin-top: 32px;
                "
              >
                Kind regards,<br />
                <strong>
                  Ask Michael AI
                </strong>
              </p>

            </div>

          `,

        });



      // =================================================
      // CHECK RESEND RESULT
      // =================================================

      if (emailResult.error) {

        console.error(
          "Partner invitation email failed:",
          emailResult.error
        );


        return NextResponse.json(
          {
            error:
              "Partner approved, but invitation email could not be sent.",
          },
          {
            status: 500,
          }
        );

      }


      console.log(
        "Partner invitation email sent successfully."
      );

    }



    // =====================================================
    // SUCCESS
    // =====================================================

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



// DELETE - Permanently delete partner application

export async function DELETE(req: Request) {

  try {

    const { id } =
      await req.json();


    console.log(
      "DELETE CALLED"
    );


    console.log(
      "ID:",
      id
    );


    if (!id) {

      return NextResponse.json(
        {
          error:
            "Missing partner application id",
        },
        {
          status: 400,
        }
      );

    }


    const { db } =
      await connectToDatabase();


    const result =
      await db
        .collection("partner_applications")
        .deleteOne({

          _id:
            new ObjectId(id),

        });



    if (
      result.deletedCount === 0
    ) {

      return NextResponse.json(
        {
          error:
            "Partner application not found",
        },
        {
          status: 404,
        }
      );

    }



    return NextResponse.json(
      {
        success: true,

        message:
          "Partner application deleted",
      }
    );


  } catch (error) {

    console.error(
      "Partner delete error:",
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