export function getPasswordResetOTPEmail(otp: string): { subject: string; html: string; text: string } {
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #ef4444, #dc2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Pathible</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Legacy & Heritage Management</p>
          </div>

          <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #6b7280; font-size: 16px;">You requested to reset your password. Use this code to continue:</p>

            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444; font-family: monospace;">
                ${otp}
              </div>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This code will expire in <strong>5 minutes</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated email from Pathible. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Reset Your Pathible Password\n\nYou requested to reset your password. Use this code to continue: ${otp}\n\nThis code will expire in 5 minutes. If you didn't request a password reset, please ignore this email.\n\n-- Pathible Team`,
  };
}
