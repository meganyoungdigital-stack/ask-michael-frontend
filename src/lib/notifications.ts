import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendAlertEmail({
  subject,
  message,
}: {
  subject: string;
  message: string;
}) {
  try {
    const response = await resend.emails.send({
      from: "alerts@askmichaelai.org",
      to: process.env.ALERT_EMAIL!,
      subject,
      text: message,
    });

    return response;
  } catch (error) {
    console.error("Email send error:", error);
  }
}