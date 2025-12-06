"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5 minutes in seconds

  // Refs to store interval IDs for cleanup
  const resendIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const expirationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Don't auto-redirect - let the user explicitly log in
  // The auth layout will handle redirects after successful authentication

  // Cleanup intervals on unmount or when OTP input is hidden
  useEffect(() => {
    if (!showOtpInput) {
      // Clear intervals when hiding OTP input
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
        resendIntervalRef.current = null;
      }
      if (expirationIntervalRef.current) {
        clearInterval(expirationIntervalRef.current);
        expirationIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
      if (expirationIntervalRef.current) clearInterval(expirationIntervalRef.current);
    };
  }, [showOtpInput]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use Better Auth email OTP to send code
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (result.error) {
        toast.error("Failed to send code", {
          description: result.error.message || "Please try again.",
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setShowOtpInput(true);
      setCanResend(false);
      setCountdown(60);
      setOtpExpiresIn(300); // Reset to 5 minutes

      toast.success("Code sent!", {
        description: "Check your email for the 6-digit code.",
      });

      // Clear any existing intervals before starting new ones
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
      }
      if (expirationIntervalRef.current) {
        clearInterval(expirationIntervalRef.current);
      }

      // Start resend countdown (60 seconds)
      resendIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (resendIntervalRef.current) {
              clearInterval(resendIntervalRef.current);
              resendIntervalRef.current = null;
            }
            setCanResend(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      // Start OTP expiration countdown (5 minutes)
      expirationIntervalRef.current = setInterval(() => {
        setOtpExpiresIn((prev) => {
          if (prev <= 1) {
            if (expirationIntervalRef.current) {
              clearInterval(expirationIntervalRef.current);
              expirationIntervalRef.current = null;
            }
            toast.error("Code expired", {
              description: "Please request a new code.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send code", {
        description: "Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);

    try {
      // Use Better Auth to sign in with OTP
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (result.error) {
        toast.error("Invalid code", {
          description: result.error.message || "Please try again.",
        });
        setIsLoading(false);
        setOtp("");
        return;
      }

      toast.success("Success!", {
        description: "You're being logged in...",
      });

      // Wait a moment for the session to be established, then check profile
      setTimeout(async () => {
        try {
          // Get fresh session
          const session = await authClient.getSession();

          if (!session?.data?.session) {
            // No session, go to login
            router.push("/login");
            return;
          }

          // Check if user has profile by trying to fetch it
          // We'll use a temporary query call here
          // The profile query will return null if no profile exists
          const hasProfile = await checkHasProfile();

          if (hasProfile) {
            // Has profile - route to intended destination
            router.push(redirect);
          } else {
            // No profile - route to onboarding
            router.push("/onboarding");
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          // On error, default to dashboard (auth layout will handle redirect)
          router.push(redirect);
        }
      }, 800);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid code", {
        description: "Please try again.",
      });
      setIsLoading(false);
      setOtp("");
    }
  };

  // Helper to check if user has profile
  const checkHasProfile = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/convex/token");
      const { token } = await response.json();

      if (!token) return false;

      // Call Convex directly with token
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      const profileResponse = await fetch(`${convexUrl}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: "profiles:get",
          args: {},
          format: "json",
        }),
      });

      const profileData = await profileResponse.json();
      return profileData.value !== null;
    } catch (error) {
      console.error("Error checking profile:", error);
      return false;
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtp("");
    handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  if (showOtpInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card rounded-xl p-10 shadow-lg space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowOtpInput(false);
              setOtp("");
            }}
            className="mb-4"
            data-testid="back-to-email-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-h2 text-foreground">Enter Code</h2>
            <p className="text-body text-muted-foreground">
              We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (value.length === 6) {
                    // Auto-verify when 6 digits entered
                    setTimeout(() => handleVerifyOtp(), 300);
                  }
                }}
                data-testid="otp-input"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Code expires in{" "}
                <span className="font-medium text-foreground">
                  {Math.floor(otpExpiresIn / 60)}:{String(otpExpiresIn % 60).padStart(2, "0")}
                </span>
              </p>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6 || otpExpiresIn === 0}
              className="btn-primary w-full"
              data-testid="verify-code-button"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  Verifying...
                </>
              ) : otpExpiresIn === 0 ? (
                "Code Expired"
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center space-y-2">
              {!canResend ? (
                <p className="text-sm text-muted-foreground">Resend code in {countdown}s</p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  className="text-primary"
                  data-testid="resend-code-button"
                >
                  Resend code
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/pathible-logo.svg"
            alt="Pathible"
            width={150}
            height={150}
            className="h-12 w-auto"
          />
        </div>

        <div className="bg-card rounded-xl p-10 shadow-lg space-y-6">
          <div className="space-y-2">
            <h2 className="text-h2 text-foreground">Welcome to Your Legacy</h2>
            <p className="text-secondary">Secure family access via email</p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="family-email" className="text-small font-medium">
                Email Address
              </Label>
              <Input
                id="family-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                data-testid="email-input"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
              data-testid="send-code-button"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  Sending...
                </>
              ) : (
                "Send Code"
              )}
            </Button>
          </form>

          <p className="text-caption text-muted-foreground text-center">
            No password needed. We&apos;ll email you a 6-digit code.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="spinner" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
