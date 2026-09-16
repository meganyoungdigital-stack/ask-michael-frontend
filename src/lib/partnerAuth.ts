import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const PARTNER_SESSION_COOKIE =
  "partnerSession";

const SESSION_MAX_AGE_SECONDS =
  60 * 60 * 8;

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createPartnerSession(
  partnerId: string
) {
  if (!ObjectId.isValid(partnerId)) {
    throw new Error(
      "Invalid partner ID"
    );
  }

  const token =
    generateSessionToken();

  const now = new Date();

  const expiresAt =
    new Date(
      now.getTime() +
        SESSION_MAX_AGE_SECONDS *
          1000
    );

  const { db } =
    await connectToDatabase();

  await db
    .collection("partner_sessions")
    .insertOne({
      tokenHash:
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex"),

      partnerId:
        new ObjectId(partnerId),

      createdAt: now,
      expiresAt,
    });

  return token;
}

export async function verifyPartnerSession(
  session: string | undefined
) {
  if (!session) {
    return null;
  }

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(session)
      .digest("hex");

  const { db } =
    await connectToDatabase();

  const sessionRecord =
    await db
      .collection("partner_sessions")
      .findOne({
        tokenHash,
        expiresAt: {
          $gt: new Date(),
        },
      });

  if (!sessionRecord) {
    return null;
  }

  return sessionRecord.partnerId.toString();
}

export async function deletePartnerSession(
  session: string | undefined
) {
  if (!session) {
    return;
  }

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(session)
      .digest("hex");

  const { db } =
    await connectToDatabase();

  await db
    .collection("partner_sessions")
    .deleteOne({
      tokenHash,
    });
}