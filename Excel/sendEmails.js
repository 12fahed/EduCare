const nodemailer = require('nodemailer');

// Function to send emails
async function sendEmail(email) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'educare.notification@gmail.com',
            pass: 'hjtofjqmlgaeswqq'
        }
    });

    let info = await transporter.sendMail({
        from: 'educare.notification@gmail.com',
        to: email,
        subject: 'Test Email',
        text: 'This is a test email from Node.js using Nodemailer.'
    });

    console.log('Email sent: ', info.response);
}

// Array of emails
const emails = ['recipient1@example.com', 'recipient2@example.com', 'recipient3@example.com'];

// Send emails
emails.forEach(email => {
    sendEmail(email).catch(console.error);
});
