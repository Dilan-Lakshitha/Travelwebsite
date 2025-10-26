const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/send-booking-email", async (req, res) => {
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

    const mailOptions = {
      from: '"Tour Booking" <lakshithadilan6@gmail.com>',
      to: "lakshithadilan6@gmail.com",
      subject: `🛎 New Booking Received - ${tour.title}`,
      html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #4CAF50;">🎉 New Booking Received!</h1>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Date:</strong> ${new Date(bookingDate).toLocaleString()}</p>

      <hr style="border: 1px solid #eee; margin: 20px 0;" />

      <h2 style="color: #2196F3;">Customer Information</h2>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ${firstName} ${lastName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Travelers:</strong> ${travelers}</li>
      </ul>

      <hr style="border: 1px solid #eee; margin: 20px 0;" />

      <h2 style="color: #FF5722;">Tour Details</h2>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Tour:</strong> ${tour.title}</li>
        <li><strong>Duration:</strong> ${tour.duration}</li>
        <li><strong>Travel Date:</strong> ${new Date(
          travelDate
        ).toLocaleString()}</li>
        <li><strong>Total:</strong> $${total}</li>
      </ul>

      <p style="color: #555;">Please make sure to confirm and prepare for the tour!</p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    const customerMailOptions = {
      from: '"Ceylon Paradise Tours" <lakshithadilan6@gmail.com>',
      to: email,
      subject: `✨ Thank you for your booking! - ${tour.title}`,
      html: `
    <div style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px; border-radius: 10px;">
      <h1 style="color: #4CAF50;">Thank you for your booking, ${firstName}!</h1>
      <p>We are thrilled to have you join us on the tour. Here are your booking details:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Number</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Tour</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${tour.title}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
            bookingDate
          ).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">$${total}</td>
        </tr>
      </table>

      <p style="color: #555;">We look forward to seeing you and making your tour an unforgettable experience!</p>

      <p style="margin-top: 30px; font-weight: bold; color: #FF5722;">
        Best regards,<br/>
        Ceylon Paradise Tours Team
      </p>
    </div>
  `,
    };

    await transporter.sendMail(customerMailOptions);

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error sending email", error });
  }
});

app.post("/send-contact-email", async (req, res) => {
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

    await transporter.sendMail({
      from: `"Contact Form" <${email}>`,
      to: "lakshithadilan6@gmail.com",
      subject: `📩 New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial;">
          <h2>Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `,
    });

    await transporter.sendMail({
      from: '"Ceylon Paradise Tours" <lakshithadilan6@gmail.com>',
      to: email,
      subject: `✅ We received your message, ${name}`,
      html: `
        <div style="font-family: Arial; background: #f9f9f9; padding: 20px;">
          <h2>Thank you for contacting us, ${name}!</h2>
          <p>We have received your message and will get back to you shortly.</p>
          <p><strong>Your Message:</strong> ${message}</p>
          <p>Best regards,<br/>Ceylon Paradise Tours Team</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Contact emails sent successfully" });
  } catch (error) {
    console.error("Contact email error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error sending contact email" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
