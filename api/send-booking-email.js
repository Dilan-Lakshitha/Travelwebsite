import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    travelers,
    tour,
    orderNumber,
    total,
    bookingDate,
    travelDate,
  } = req.body;

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
      from: `"Tour Booking" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🛎 New Booking Received - ${tour.title}`,
      html: `<p>Booking by ${firstName} ${lastName}</p>`,
    });

    // Customer email
    await transporter.sendMail({
      from: `"Ceylon Paradise Tours" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✨ Thank you for your booking! - ${tour.title}`,
      html: `<p>Thank you for booking, ${firstName}!</p>`,
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Error sending email", error });
  }
}
