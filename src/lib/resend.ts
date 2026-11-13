import { Resend } from "resend";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is missing");
  }

  return {
    resend: new Resend(apiKey),
    fromEmail,
  };
}