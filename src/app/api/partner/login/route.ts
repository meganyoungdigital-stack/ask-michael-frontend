import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createPartnerSession, PARTNER_SESSION_COOKIE } from "@/lib/partnerAuth";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(req: Request) {

  try {


    const {
      email,
      password
    } = await req.json();



    const { db } = await connectToDatabase();



    const partner = await db
      .collection("partners")
      .findOne({
        email
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



    const session = createPartnerSession(
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