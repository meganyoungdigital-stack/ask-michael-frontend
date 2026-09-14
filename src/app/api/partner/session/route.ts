import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  PARTNER_SESSION_COOKIE,
  verifyPartnerSession,
} from "@/lib/partnerAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const session =
      cookieStore.get(
        PARTNER_SESSION_COOKIE
      )?.value;

    const partnerId =
      verifyPartnerSession(session);

    return NextResponse.json({
      authenticated: !!partnerId,
    });
  } catch (error) {
    console.error(
      "PARTNER SESSION CHECK ERROR:",
      error
    );

    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 500,
      }
    );
  }
}