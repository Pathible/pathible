export function getEmailVerificationOTPEmail(otp: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Verify Your Pathible Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <!-- Email Container -->
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
            <tr>
              <td style="padding: 40px 20px;">
                <!-- Main Content Card -->
                <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-collapse: collapse;">

                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 48px 48px 32px 48px; text-align: center;">
                      <div style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px;">
                        Pathible
                      </div>
                      <div style="font-size: 13px; color: #9ca3af; letter-spacing: 0.5px;">
                        Legacy & Heritage Management
                      </div>
                    </td>
                  </tr>

                  <!-- Icon Illustration -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px; text-align: center;">
                      <svg width="120" height="120" viewBox="0 0 120 120" style="display: inline-block;">
                        <!-- Outer Circle Background -->
                        <circle cx="60" cy="60" r="58" fill="#f0fdf4" stroke="#d1fae5" stroke-width="2"/>

                        <!-- Envelope -->
                        <defs>
                          <linearGradient id="envelopeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                          </linearGradient>
                        </defs>

                        <!-- Envelope body -->
                        <rect x="35" y="45" width="50" height="35" rx="3" fill="url(#envelopeGradient)" opacity="0.15"/>
                        <rect x="38" y="48" width="44" height="29" rx="2" fill="url(#envelopeGradient)"/>

                        <!-- Envelope flap -->
                        <path d="M38 48 L60 65 L82 48" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

                        <!-- Checkmark badge -->
                        <circle cx="75" cy="40" r="12" fill="#10b981"/>
                        <path d="M70 40 L73 43 L80 36" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </td>
                  </tr>

                  <!-- Main Heading -->
                  <tr>
                    <td style="padding: 0 48px 16px 48px; text-align: center;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: #111827; line-height: 1.3;">
                        Verify Your Email Address
                      </h1>
                    </td>
                  </tr>

                  <!-- Description -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px; text-align: center;">
                      <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">
                        Enter this code to confirm your email and complete your account setup
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Code Box (Hero Element) -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #a7f3d0; border-radius: 12px; padding: 32px 24px; text-align: center;">
                            <div style="font-size: 48px; font-weight: 700; letter-spacing: 16px; color: #10b981; font-family: 'Courier New', Courier, monospace; line-height: 1.2;">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Expiration Notice -->
                  <tr>
                    <td style="padding: 0 48px 40px 48px; text-align: center;">
                      <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.6;">
                        Code expires in <span style="font-weight: 600; color: #6b7280;">5 minutes</span>
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 48px;">
                      <div style="height: 1px; background-color: #e5e7eb;"></div>
                    </td>
                  </tr>

                  <!-- Security Notice -->
                  <tr>
                    <td style="padding: 32px 48px 48px 48px;">
                      <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; line-height: 1.6; text-align: center;">
                        Verifying your email helps keep your account secure and ensures you receive important updates about your heritage vault.
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
                        <a href="https://pathible.com" style="color: #10b981; text-decoration: none; font-weight: 500;">pathible.com</a>
                      </p>
                    </td>
                  </tr>

                </table>

                <!-- Footer -->
                <table role="presentation" style="max-width: 560px; margin: 24px auto 0 auto; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0 20px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                        This is an automated message from Pathible. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Verify Your Pathible Email Address\n\nPlease use this code to verify your email address: ${otp}\n\nThis code will expire in 5 minutes. Verifying your email helps keep your account secure.\n\n-- Pathible Team`,
  };
}
