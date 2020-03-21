const nodemailer = require("nodemailer");

const sendMail = (email, subjectMail, bodyMail) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "paladinistormentor@gmail.com",
      pass: process.env.GMAIL_PASSWORD
    }
  });

  var mailOptions = {
    from: "paladinistormentor@gmail.com",
    to: email,
    subject: !subjectMail
      ? "Thank you for signing up on Invoice Manager created by Dilip"
      : subjectMail,
    text: !bodyMail
      ? "Thank you for signing up, you can now manage your warranty documents for your home appliances very easily"
      : bodyMail
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendMail;
