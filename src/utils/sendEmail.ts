import nodemailer from "nodemailer";

export const sendEmail = (userEmail: string, subject: string, html: string) => {
  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Configure the mailoptions object
  const mailOptions = {
    from: `"Movie Palace" ${process.env.EMAIL_USER}`,
    to: userEmail,
    subject: subject,
    html,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
