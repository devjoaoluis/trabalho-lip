import nodemailer from "nodemailer";

export const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    await transpoter.sendMail({
      from: `"Suporte LIP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Email enviado para ", to);
  } catch (error) {
    console.error("Error ao enviar email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  const subject = "Recuperação de senha - LIP";
  const text = `Você solicitou a recuperação de senha. Acesse o link para redefinir sua senha:\n\n${resetLink}\n\nSe você não solicitou, ignore este e-mail.`;
  return sendEmail(to, subject, text);
}
