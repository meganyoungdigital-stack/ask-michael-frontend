import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { Resend } from "resend";
import {
  SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";

import {
  PARTNER_PLANS,
  type PartnerPlan,
  type PartnerCurrency,
} from "@/lib/partnerPlans";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

async function requireAdmin() {
  const cookieStore = await cookies();

  const session =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  const adminId =
    verifyAdminSession(session);

  if (!adminId) {
    return null;
  }

  return adminId;
}

// GET - Load partner applications

export async function GET() {

  const adminId = await requireAdmin();

  if (!adminId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {

    const { db } = await connectToDatabase();


    const applications = await db
      .collection("partner_applications")
      .find(
        {},
        {
          projection: {
            _id: 1,
            companyName: 1,
            contactName: 1,
            email: 1,
            website: 1,
            message: 1,
            status: 1,
            createdAt: 1,
          },
        }
      )
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json(
      applications
    );


  } catch (error) {

    return NextResponse.json(
  {
    error: "An internal server error occurred",
  },
  {
    status: 500,
  }
);

  }

}



// PATCH - Approve / Reject / Suspend partner

export async function PATCH(req: Request) {

  const adminId = await requireAdmin();

  if (!adminId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {

    const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    {
      error: "Invalid request body",
    },
    {
      status: 400,
    }
  );
}

const {
  id,
  status,
  plan,
  monthlyFee,
  includedMessages,
  pricePerMessage,
  maxUsers,
  maxMessages,
  currency,
} = body as {
  id?: unknown;
  status?: unknown;
  plan?: unknown;
  monthlyFee?: unknown;
  includedMessages?: unknown;
  pricePerMessage?: unknown;
  maxUsers?: unknown;
  maxMessages?: unknown;
  currency?: unknown;
};

if (
  typeof id !== "string" ||
  typeof status !== "string" ||
  id.trim().length === 0 ||
  status.trim().length === 0
) {
  return NextResponse.json(
    {
      error: "Invalid partner application details",
    },
    {
      status: 400,
    }
  );
}

const cleanId = id.trim();
const cleanStatus = status.trim();

console.log("PATCH CALLED");
console.log("Status:", cleanStatus);
console.log("ID:", cleanId);

let selectedPlan: PartnerPlan | null = null;

if (status === "approved") {

  if (
    plan !== "starter" &&
    plan !== "business" &&
    plan !== "enterprise"
  ) {
    return NextResponse.json(
      {
        error: "A valid partner plan is required.",
      },
      {
        status: 400,
      }
    );
  }

  selectedPlan = plan;

  if (plan === "enterprise") {

  if (
    typeof monthlyFee !== "number" ||
    typeof includedMessages !== "number" ||
    typeof pricePerMessage !== "number" ||
    typeof maxUsers !== "number" ||
    typeof maxMessages !== "number" ||
    typeof currency !== "string" ||
    !["ZAR", "USD", "EUR", "GBP"].includes(currency)
  ) {
    return NextResponse.json(
      {
        error:
          "Valid Enterprise pricing details and currency are required.",
      },
      {
        status: 400,
      }
    );
  }
}
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

    const applicationUpdate: Record<string, unknown> = {
  status,
  updatedAt: new Date(),
};

if (status === "approved" && selectedPlan) {

  const planConfig =
    PARTNER_PLANS[selectedPlan];

  applicationUpdate.plan = selectedPlan;
  applicationUpdate.currency =
    selectedPlan === "enterprise"
      ? currency
      : planConfig.currency;

  applicationUpdate.monthlyFee =
    selectedPlan === "enterprise"
      ? monthlyFee
      : planConfig.monthlyFee;

  applicationUpdate.includedMessages =
    selectedPlan === "enterprise"
      ? includedMessages
      : planConfig.includedMessages;

  applicationUpdate.pricePerMessage =
    selectedPlan === "enterprise"
      ? pricePerMessage
      : planConfig.pricePerMessage;

  applicationUpdate.maxUsers =
    selectedPlan === "enterprise"
      ? maxUsers
      : planConfig.maxUsers;

  applicationUpdate.maxMessages =
    selectedPlan === "enterprise"
      ? maxMessages
      : planConfig.maxMessages;
}

await db
  .collection("partner_applications")
  .updateOne(
    {
      _id: new ObjectId(id),
    },
    {
      $set: applicationUpdate,
    }
  );

// Re-fetch the application after saving the approved
// plan and pricing so the invitation receives the
// updated values.

const updatedApplication =
  await db
    .collection("partner_applications")
    .findOne({
      _id: new ObjectId(id),
    });

if (!updatedApplication) {
  return NextResponse.json(
    {
      error:
        "Failed to reload updated partner application",
    },
    {
      status: 500,
    }
  );
}

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
let token = "";

// =================================================
// LOOK FOR EXISTING PENDING INVITATION
// =================================================

const existingInvitation =
  await db
    .collection("partner_invitations")
    .findOne({
      email: application.email,
      status: "pending",
    });




// =================================================
// CREATE NEW INVITATION
// =================================================

if (!existingInvitation) {

  token = crypto.randomUUID();

  const tokenHash =
  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

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

      tokenHash,

      status:
        "pending",

      plan:
  updatedApplication.plan,

currency:
  updatedApplication.currency,

monthlyFee:
  updatedApplication.monthlyFee,

includedMessages:
  updatedApplication.includedMessages,

pricePerMessage:
  updatedApplication.pricePerMessage,

maxUsers:
  updatedApplication.maxUsers,

maxMessages:
  updatedApplication.maxMessages,

      createdAt:
  new Date(),

expiresAt:
  new Date(
    Date.now() +
      1000 * 60 * 60 * 24 * 7
  ),
    });

  console.log(
    "Invitation created successfully"
  );

} else {

  // =================================================
  // EXISTING INVITATION
  // UPDATE IT WITH THE NEW APPROVED PLAN
  // =================================================

  token = crypto.randomUUID();

const tokenHash =
  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

console.log(
  "Existing pending invitation found. Updating plan..."
);

  await db
  .collection("partner_invitations")
  .updateOne(
    {
      _id: existingInvitation._id,
    },
    {
      $set: {
        companyName:
          application.companyName,

        contactName:
          application.contactName,

        email:
          application.email,

        tokenHash,

        plan:
          updatedApplication.plan,

        currency:
          updatedApplication.currency,

        monthlyFee:
          updatedApplication.monthlyFee,

        includedMessages:
          updatedApplication.includedMessages,

        pricePerMessage:
          updatedApplication.pricePerMessage,

        maxUsers:
          updatedApplication.maxUsers,

        maxMessages:
          updatedApplication.maxMessages,

        updatedAt:
          new Date(),
      },

      $unset: {
        token: "",
      },
    }
  );

  console.log(
    "Existing invitation updated successfully."
  );

}

      



      // =================================================
      // REGISTRATION LINK
      // =================================================

      const registrationLink =
        `https://askmichaelai.org/partner-register/${token}`;


      console.log(
  "Partner registration invitation link generated successfully."
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

  const adminId = await requireAdmin();

  if (!adminId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

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