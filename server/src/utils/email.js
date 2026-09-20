const https = require('https');
const logger = require('./logger');

const sendEmail = ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not set in environment');

  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const fromName  = process.env.EMAIL_FROM_NAME;

  const payload = JSON.stringify({
    sender:      { name: fromName, email: fromEmail },
    to:          [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path:     '/v3/smtp/email',
        method:   'POST',
        headers: {
          'accept':         'application/json',
          'api-key':        apiKey,
          'content-type':   'application/json',
          'content-length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            logger.info(`Email sent to ${to}`);
            resolve();
          } else {
            let msg = `Brevo API error ${res.statusCode}`;
            try { msg = JSON.parse(body).message || msg; } catch {}
            logger.error(`Email send failed: ${msg}`);
            reject(new Error(msg));
          }
        });
      }
    );

    req.on('error', (err) => {
      logger.error(`Email send failed: ${err.message}`);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

const emailShell = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#fdfaf5;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdfaf5;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#b8823a 0%,#9a6a2c 100%);padding:32px 40px;border-radius:20px 20px 0 0;text-align:center;">
            <h1 style="margin:0;font-family:'Georgia',serif;font-size:32px;font-weight:normal;color:#ffffff;letter-spacing:2px;">USMS</h1>
            <p style="margin:6px 0 0;font-size:12px;color:#f7eedc;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">University Student Management</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-left:1px solid #eedcb8;border-right:1px solid #eedcb8;">
            ${bodyContent}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fdfaf5;padding:20px 40px;border-radius:0 0 20px 20px;border:1px solid #eedcb8;border-top:none;text-align:center;">
            <p style="margin:0;font-size:11px;color:#cfa05e;font-family:Arial,sans-serif;letter-spacing:1px;">
              USMS &copy; ${new Date().getFullYear()} &nbsp;&middot;&nbsp; University Student Management System
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const verificationEmail = (name, otp) => ({
  subject: 'Your verification code – USMS',
  html: emailShell(`
    <h2 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;font-weight:normal;color:#3b2610;">Verify your email</h2>
    <p style="margin:0 0 24px;font-size:13px;color:#7c5222;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">One step away</p>

    <p style="color:#5e3d1a;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
    <p style="color:#5e3d1a;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;margin:0 0 32px;">
      Use the code below to verify your account. It expires in <strong>10 minutes</strong>.
    </p>

    <!-- OTP Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center">
        <div style="display:inline-block;background:#fdfaf5;border:1.5px solid #eedcb8;border-radius:16px;padding:28px 48px;">
          <span style="font-family:'Georgia',serif;font-size:42px;font-weight:bold;letter-spacing:16px;color:#b8823a;">${otp}</span>
        </div>
      </td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #f7eedc;margin:0 0 24px;"/>
    <p style="color:#cfa05e;font-size:13px;font-family:Arial,sans-serif;margin:0;line-height:1.6;">
      If you did not create an account, you can safely ignore this email.
    </p>
  `),
});

const passwordResetEmail = (name, resetUrl) => ({
  subject: 'Password Reset Request – USMS',
  html: emailShell(`
    <h2 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;font-weight:normal;color:#3b2610;">Reset your password</h2>
    <p style="margin:0 0 24px;font-size:13px;color:#7c5222;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">Account security</p>

    <p style="color:#5e3d1a;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
    <p style="color:#5e3d1a;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;margin:0 0 32px;">
      We received a request to reset your password. Click the button below — this link expires in <strong>10 minutes</strong>.
    </p>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center">
        <a href="${resetUrl}"
           style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#b8823a 0%,#9a6a2c 100%);color:#ffffff;text-decoration:none;border-radius:50px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;letter-spacing:1px;">
          Reset Password
        </a>
      </td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #f7eedc;margin:0 0 24px;"/>
    <p style="color:#cfa05e;font-size:13px;font-family:Arial,sans-serif;margin:0;line-height:1.6;">
      If you did not request a password reset, no action is needed — your account remains secure.
    </p>
  `),
});

module.exports = { sendEmail, verificationEmail, passwordResetEmail };