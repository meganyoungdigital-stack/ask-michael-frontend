import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createPartnerSession, PARTNER_SESSION_COOKIE } from "@/lib/partnerAuth";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { partnerLoginRatelimit } from "@/lib/ratelimit";

export async function POST(req: Request) {

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
  email,
  password,
} = body as {
  email?: unknown;
  password?: unknown;
};

if (
  typeof email !== "string" ||
  typeof password !== "string"
) {
  return NextResponse.json(
    {
      error: "Email and password are required",
    },
    {
      status: 400,
    }
  );
}

const cleanEmail = email.trim().toLowerCase();

if (
  cleanEmail.length === 0 ||
  password.length === 0
) {
  return NextResponse.json(
    {
      error: "Email and password are required",
    },
    {
      status: 400,
    }
  );
}

if (
  cleanEmail.length > 320 ||
  password.length > 200
) {
  return NextResponse.json(
    {
      error: "Login details exceed the maximum allowed length",
    },
    {
      status: 400,
    }
  );
}

const rateLimitResult =
  await partnerLoginRatelimit.limit(
    cleanEmail
  );

if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error:
        "Too many login attempts. Please try again later.",
    },
    {
      status: 429,
    }
  );
}

    const { db } = await connectToDatabase();



    const partner = await db
      .collection("partners")
      .findOne({
        email: cleanEmail
      });



    if (!partner) {

      return NextResponse.json(
        {
          error: "Partner account not found",
        },
        {
          status: 404,
        }
      );

    }



    const passwordMatch = await bcrypt.compare(
      password,
      partner.passwordHash
    );



    if (!passwordMatch) {

      return NextResponse.json(
        {
          error: "Invalid password",
        },
        {
          status: 401,
        }
      );

    }



const session = await createPartnerSession(
  partner._id.toString()
);

const cookieStore = await cookies();

cookieStore.set(
  PARTNER_SESSION_COOKIE,
  session,
  {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  }
);

return NextResponse.json({
  success: true,
  partner: {
    companyName: partner.companyName,
    email: partner.email,
  }
});



  } catch (error) {


    console.error(
      "Partner login error:",
      error
    );



    return NextResponse.json(
      {
        error: "Login failed",
      },
      {
        status: 500,
      }
    );


  }

}