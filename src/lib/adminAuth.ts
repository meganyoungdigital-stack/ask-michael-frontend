import crypto from "crypto";

const SESSION_COOKIE = "adminSession";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured"
    );
  }

  return secret;
}

export function createAdminSession(adminId: string) {
  const timestamp = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(`${adminId}:${timestamp}`)
    .digest("hex");

  return `${adminId}.${timestamp}.${signature}`;
}

export function verifyAdminSession(
  session: string | undefined
) {
  if (!session) {
    return null;
  }

  const parts = session.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [adminId, timestamp, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(`${adminId}:${timestamp}`)
    .digest("hex");

  const signaturesMatch =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

  if (!signaturesMatch) {
    return null;
  }

  const sessionAge =
    Date.now() - Number(timestamp);

  const maxAge =
    1000 * 60 * 60 * 8;

  if (
    !Number.isFinite(sessionAge) ||
    sessionAge < 0 ||
    sessionAge > maxAge
  ) {
    return null;
  }

  return adminId;
}

export { SESSION_COOKIE };