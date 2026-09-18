import crypto from "crypto";

export function hashPartnerApiKey(
  apiKey: string
) {
  return crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex");
}

export function generatePartnerApiKey(
  prefix: "am_live_" | "am_test_"
) {
  return (
    prefix +
    crypto
      .randomBytes(24)
      .toString("hex")
  );
}