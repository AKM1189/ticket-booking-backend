"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (userEmail, subject, html) => {
    // Create a transporter object
    const transporter = nodemailer_1.default.createTransport({
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
        }
        else {
            console.log("Email sent: " + info.response);
        }
    });
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map