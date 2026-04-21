import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use any Service ID from the table below (case-insensitive)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default function enviarEmail(para, asunto, cuerpo) {
    return transporter.sendMail({
        from: `"La Grupeta" <${process.env.SMTP_USER}>`,
        to: para,
        subject: asunto,
        html: cuerpo
    });
};