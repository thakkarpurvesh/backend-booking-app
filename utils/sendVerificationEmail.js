const nodemailer = require('nodemailer');

const sendVerificationEmail = async (toEmail, url) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const options = {
      from: '"Booking System App" <no-reply@myapp.com>',
      to: toEmail,
      subject: 'Email Verification',
      html: `<p>Click the link to verify your email:</p><a href="${url}">${url}</a>`,
    };
  
    const info = await transporter.sendMail(options);
    console.log('Verification email sent:', info.response);
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
    throw new Error('Could not send verification email');
  }
  };
  
  module.exports = sendVerificationEmail;