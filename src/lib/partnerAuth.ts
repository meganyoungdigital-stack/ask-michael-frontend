import crypto from "crypto";

export const PARTNER_SESSION_COOKIE =
  "partnerSession";

const SESSION_MAX_AGE_SECONDS =
  60 * 60 * 8;

function getSecret() {
  const secret =
    process.env.PARTNER_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "PARTNER_SESSION_SECRET is not configured"
    );
  }

  return secret;
}

export function createPartnerSession(
  partnerId: string
) {
  const timestamp =
    Date.now().toString();

  const signature =
    crypto
      .createHmac(
        "sha256",
        getSecret()
      )
      .update(
        `${partnerId}:${timestamp}`
      )
      .digest("hex");

  return `${partnerId}.${timestamp}.${signature}`;
}

export function verifyPartnerSession(
  session: string | undefined
) {
  if (!session) {
    return null;
  }

  const parts =
    session.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [
    partnerId,
    timestamp,
    signature,
  ] = parts;

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        getSecret()
      )
      .update(
        `${partnerId}:${timestamp}`
      )
      .digest("hex");

  const signaturesMatch =
    signature.length ===
      expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(
        expectedSignature
      )
    );

  if (!signaturesMatch) {
    return null;
  }

  const sessionAge =
    Date.now() -
    Number(timestamp);

  const maxAge =
    SESSION_MAX_AGE_SECONDS *
    1000;

  if (
    !Number.isFinite(sessionAge) ||
    sessionAge < 0 ||
    sessionAge > maxAge
  ) {
    return null;
  }

  return partnerId;
}