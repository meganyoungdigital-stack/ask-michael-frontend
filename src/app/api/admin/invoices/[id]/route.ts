import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import {
  SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";


async function requireAdmin() {

  const cookieStore =
    await cookies();

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


export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  const adminId =
    await requireAdmin();

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
      await context.params;


    if (
      !ObjectId.isValid(id)
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid invoice ID",
        },
        {
          status: 400,
        }
      );

    }


    const { db } =
      await connectToDatabase();


    const invoice =
      await db
        .collection("invoices")
        .findOne({
          _id:
            new ObjectId(id),
        });


    if (!invoice) {

      return NextResponse.json(
        {
          error:
            "Invoice not found",
        },
        {
          status: 404,
        }
      );

    }


    return NextResponse.json(
      invoice
    );


  } catch (error) {

    console.error(
      "Admin invoice error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Failed loading invoice",
      },
      {
        status: 500,
      }
    );

  }

}