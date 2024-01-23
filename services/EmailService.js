const sgMail = require("@sendgrid/mail");
const { CustomError } = require("../errors");

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    this.fromEmail = "NextGen Code <nextgencodeworks@gmail.com>";

    this.origin = "http://localhost:3000"; // change it when live !
  }

  async sendEmail({ to, subject, html }) {
    try {
      const msg = {
        from: this.fromEmail,
        to,
        subject,
        html,
      };
      await sgMail.send(msg);
    } catch (error) {
      console.error("error sending email:", error);
      throw new CustomError("Failed to send email.");
    }
  }

  async sendVerificationEmail({ name, email, verificationToken }) {
    const verifyEmailUrl = `${this.origin}/user/verify-email?token=${verificationToken}&email=${email}`;
    const message = `<p>Please confirm your email by clicking on the following link :
    <a href="${verifyEmailUrl}">Verify Email</a> </p>`;

    return this.sendEmail({
      to: email,
      subject: "Email Confirmation",
      html: `<h4> Hello, ${name}</h4> ${message}`,
    });
  }

  async sendResetPasswordEmail({ name, email }, token) {
    const resetURL = `${this.origin}/user/reset-password?token=${token}&email=${email}`;
    const message = `<p>Please reset password by clicking on the following link :
    <a href="${resetURL}">Reset Password</a></p>`;

    return this.sendEmail({
      to: email,
      subject: "Reset Password",
      html: `<h4>Hello, ${name}</h4> ${message}`,
    });
  }
}

module.exports = new EmailService();
