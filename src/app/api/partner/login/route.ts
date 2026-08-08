import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";


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



    return NextResponse.json(
      {

        success: true,

        token: partner._id.toString(),

        partner: {

          companyName: partner.companyName,

          email: partner.email,

        }

      }
    );



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