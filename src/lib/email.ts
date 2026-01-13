import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        await transporter.sendMail({
            from: `"AgencyOS" <${env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Email error:", error);
        return { success: false, error };
    }
}
