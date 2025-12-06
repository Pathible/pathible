export function getSignInOTPEmail(otp: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Your Pathible Sign In Code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign In to Pathible</title>
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
                      <div style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px;">
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
                        <circle cx="60" cy="60" r="58" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2"/>

                        <!-- Shield Shape -->
                        <defs>
                          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
                          </linearGradient>
                        </defs>
                        <path d="M60 25 L45 30 L45 50 Q45 70 60 85 Q75 70 75 50 L75 30 Z" fill="url(#shieldGradient)" opacity="0.15"/>
                        <path d="M60 30 L48 34 L48 50 Q48 67 60 80 Q72 67 72 50 L72 34 Z" fill="url(#shieldGradient)"/>

                        <!-- Key Icon Inside Shield -->
                        <circle cx="60" cy="48" r="4" fill="white"/>
                        <rect x="58.5" y="50" width="3" height="12" rx="1.5" fill="white"/>
                        <rect x="58.5" y="58" width="3" height="2" fill="white"/>
                        <rect x="58.5" y="62" width="3" height="2" fill="white"/>
                      </svg>
                    </td>
                  </tr>

                  <!-- Main Heading -->
                  <tr>
                    <td style="padding: 0 48px 16px 48px; text-align: center;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: #111827; line-height: 1.3;">
                        Your Sign In Code
                      </h1>
                    </td>
                  </tr>

                  <!-- Description -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px; text-align: center;">
                      <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">
                        Enter this code to securely access your Pathible account
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Code Box (Hero Element) -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #eef2ff 0%, #f3e8ff 100%); border: 2px solid #c7d2fe; border-radius: 12px; padding: 32px 24px; text-align: center;">
                            <div style="font-size: 48px; font-weight: 700; letter-spacing: 16px; color: #4f46e5; font-family: 'Courier New', Courier, monospace; line-height: 1.2;">
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
                        If you didn't request this code, you can safely ignore this email. Your account remains secure.
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
                        <a href="https://pathible.com" style="color: #6366f1; text-decoration: none; font-weight: 500;">pathible.com</a>
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
    text: `Your Pathible Sign In Code\n\nUse this code to sign in to your account: ${otp}\n\nThis code will expire in 5 minutes. If you didn't request this code, please ignore this email.\n\n-- Pathible Team`,
  };
}
