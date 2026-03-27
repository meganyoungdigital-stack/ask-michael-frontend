import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

/* ============================
   SEND ALERT EMAIL
============================ */

export async function sendAlertEmail(alert: any) {
  try {
    if (!process.env.ALERT_EMAIL) return;

    await resend.emails.send({
      from: "alerts@yourapp.com",
      to: process.env.ALERT_EMAIL,
      subject: `🚨 ${alert.severity} Alert: ${alert.type}`,
      html: `
        <h2>Industrial Alert Triggered</h2>

        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Value:</strong> ${alert.value ?? "-"}</p>

        <hr />

        <p>Time: ${new Date().toLocaleString()}</p>
      `,
    });
  } catch (err) {
    console.error("Email notification error:", err);
  }
}