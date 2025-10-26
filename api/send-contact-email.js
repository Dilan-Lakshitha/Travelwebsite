import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, whatsapp, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Admin email
    await transporter.sendMail({
      from: `"Contact Form" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact Form Submission from ${name}`,
      html: `<p>${message}</p>`,
    });

    // Customer email
    await transporter.sendMail({
      from: `"Ceylon Paradise Tours" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ We received your message, ${name}`,
      html: `<p>Thank you for contacting us, ${name}!</p>`,
    });

    res.status(200).json({ success: true, message: "Contact emails sent successfully" });
  } catch (error) {
    console.error("Contact email error:", error);
    res.status(500).json({ success: false, message: "Error sending contact email" });
  }
}
