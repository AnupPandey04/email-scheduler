import "dotenv/config";
import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

export async function verifyEmailTransporter() {
  await transporter.verify();
  console.log("SMTP connection and authentication successful");
}

export interface SendEmailInput {
  recipient: string;
  subject: string;
  body: string;
}

export async function sendEmail({
  recipient,
  subject,
  body,
}: SendEmailInput) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject,
    text: body,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info),
  };
}