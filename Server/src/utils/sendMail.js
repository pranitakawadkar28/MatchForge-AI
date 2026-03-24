import nodemailer from "nodemailer";
import { 
    EMAIL_HOST, 
    EMAIL_PORT, 
    EMAIL_USER, 
    EMAIL_PASS 
} from "../config/env.js";

export const sendEmail = async (to, subject, html) => {
    if (!to) throw new Error("Recipient email missing");
  
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,              // smtp.gmail.com
      port: Number(EMAIL_PORT),      // 587
      secure: false,                 // false for 587
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MatchForge-AI" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
};