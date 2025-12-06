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
        <body style="margin: 0; padding: 0; background-color: #F6F4F1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <!-- Email Container -->
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F6F4F1;">
            <tr>
              <td style="padding: 40px 20px;">
                <!-- Main Content Card -->
                <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-collapse: collapse;">

                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 48px 48px 32px 48px; text-align: center;">
                      <div style="font-size: 32px; font-weight: 700; color: #4B7F52; margin-bottom: 8px;">
                        Pathible
                      </div>
                      <div style="font-size: 13px; color: #8B8680; letter-spacing: 0.5px;">
                        Your voice. Your values. Your legacy.
                      </div>
                    </td>
                  </tr>

                  <!-- Main Heading -->
                  <tr>
                    <td style="padding: 0 48px 16px 48px; text-align: center;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: #2C2C2C; line-height: 1.3;">
                        Your Sign In Code
                      </h1>
                    </td>
                  </tr>

                  <!-- Description -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px; text-align: center;">
                      <p style="margin: 0; font-size: 15px; color: #8B8680; line-height: 1.6;">
                        Enter this code to securely access your Pathible account
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Code Box (Hero Element) -->
                  <tr>
                    <td style="padding: 0 48px 32px 48px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f0f7f1 0%, #e8f0e9 100%); border: 2px solid #7BA083; border-radius: 12px; padding: 32px 24px; text-align: center;">
                            <div style="font-size: 48px; font-weight: 700; letter-spacing: 16px; color: #4B7F52; font-family: 'Courier New', Courier, monospace; line-height: 1.2;">
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
                      <p style="margin: 0; font-size: 13px; color: #8B8680; line-height: 1.6;">
                        Code expires in <span style="font-weight: 600; color: #2C2C2C;">5 minutes</span>
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
                      <p style="margin: 0 0 16px 0; font-size: 14px; color: #8B8680; line-height: 1.6; text-align: center;">
                        If you didn't request this code, you can safely ignore this email. Your account remains secure.
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #8B8680; text-align: center;">
                        <a href="https://pathible.com" style="color: #4B7F52; text-decoration: none; font-weight: 500;">pathible.com</a>
                      </p>
                    </td>
                  </tr>

                </table>

                <!-- Footer -->
                <table role="presentation" style="max-width: 560px; margin: 24px auto 0 auto; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0 20px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #8B8680; line-height: 1.5;">
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
