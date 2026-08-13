import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const session = cookieStore.get(
      SESSION_COOKIE
    )?.value;

    const adminId =
      verifyAdminSession(session);

    if (!adminId) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      authenticated: true,
    });

  } catch (error) {

    console.error(
      "Admin session check error:",
      error
    );

    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
      }
    );

  }
}