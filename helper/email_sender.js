const nodemailsender = require("nodemailer");

exports.sendMail = async function (email, subject, body) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailsender.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: body,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Error sending email: ", error);
                reject(Error(error));
            };

            console.log("Email sent: " + info.response);
            resolve({ message: 'password reset link has been sent to your email.' });
        });
    });
}

