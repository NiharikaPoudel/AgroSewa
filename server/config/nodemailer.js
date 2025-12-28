import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',  // Brevo SMTP host
    port: 587,                      // TLS port
    secure: false,                  // true if using port 465
    auth: {
        user: process.env.SMTP_USER, // 9d9b8c001@smtp-brevo.com
        pass: process.env.SMTP_PASS, // bsk8tx3Xou4rGiA
    },
    tls: {
        rejectUnauthorized: false,   // allow self-signed certificates (dev only)
    },
});

// transporter.verify((error, success) => {
//     if (error) {
//         console.log('SMTP Connection Error:', error);
//     } else {
//         console.log('SMTP Server is ready to take messages');
//     }
// });

export default transporter;
