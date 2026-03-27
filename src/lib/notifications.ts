import { Resend } from "resend";

/* ============================
   SAFE RESEND INIT (NO CRASH)
============================ */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/* ============================
   SEND ALERT EMAIL
============================ */

export async function sendAlertEmail({
  subject,
  message,
}: {
  subject: string;
  message: string;
}) {
  try {
    /* ============================
       SAFETY CHECKS
    ============================ */

    if (!resend) {
      console.warn("⚠️ Resend not configured (missing API key)");
      return;
    }

    if (!process.env.ALERT_EMAIL) {
      console.warn("⚠️ ALERT_EMAIL not set");
      return;
    }

    /* ============================
       SEND EMAIL
    ============================ */

    const response = await resend.emails.send({
      from: "alerts@askmichaelai.org",
      to: process.env.ALERT_EMAIL,
      subject,
      text: message,
    });

    return response;
  } catch (error) {
    console.error("❌ Email send error:", error);
  }
}