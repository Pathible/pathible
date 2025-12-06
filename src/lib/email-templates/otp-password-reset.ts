export function getPasswordResetOTPEmail(otp: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Reset Your Pathible Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
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
                      <div style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px;">
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
                        <circle cx="60" cy="60" r="58" fill="#fffbeb" stroke="#fde68a" stroke-width="2"/>

                        <!-- Lock body -->
                        <defs>
                          <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
                          </linearGradient>
                        </defs>

                        <!-- Lock shackle (open) -->
                        <path d="M50 45 L50 35 Q50 25 60 25 Q70 25 70 35 L70 40" fill="none" stroke="url(#lockGradient)" stroke-width="4" stroke-linecap="round" opacity="0.3"/>

                        <!-- Lock body -->
                        <rect x="45" y="50" width="30" height="25" rx="3" fill="url(#lockGradient)" opacity="0.15"/>
                        <rect x="48" y="53" width="24" height="19" rx="2" fill="url(#lockGradient)"/>

                        <!-- Keyhole -->
                        <circle cx="60" cy="60" r="3" fill="white"/>
                        <rect x="58.5" y="61" width="3" height="6" rx="1.5" fill="white"/>

                        <!-- Refresh arrow badge -->
                        <circle cx="75" cy="72" r="12" fill="#f59e0b"/>
                        <path d="M75 66 L75 66 Q79 66 81 68 Q83 70 83 74 L80 74 M75 78 L75 78 Q71 78 69 76 Q67 74 67 70 L70 70" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
                        <path d="M80 72 L82 74 L80 76" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </td>
                  </tr>

                  <!-- Main Heading -->
                  <tr>
                    <td style="padding: 0 48px 16px 48px; text-align: center;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: #111827; line-height: 1.3;">
                        Reset Your Password
                      </h1>
                    </td>
                  </tr>

                  <!-- Description -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px; text-align: center;">
                      <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">
                        You requested to reset your password. Enter this code to continue
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Code Box (Hero Element) -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #fde68a; border-radius: 12px; padding: 32px 24px; text-align: center;">
                            <div style="font-size: 48px; font-weight: 700; letter-spacing: 16px; color: #d97706; font-family: 'Courier New', Courier, monospace; line-height: 1.2;">
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
                        If you didn't request a password reset, please ignore this email or contact our support team if you have security concerns.
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
                        <a href="https://pathible.com" style="color: #d97706; text-decoration: none; font-weight: 500;">pathible.com</a>
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
    text: `Reset Your Pathible Password\n\nYou requested to reset your password. Use this code to continue: ${otp}\n\nThis code will expire in 5 minutes. If you didn't request a password reset, please ignore this email.\n\n-- Pathible Team`,
  };
}
