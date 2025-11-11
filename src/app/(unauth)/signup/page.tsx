"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate OTP send
    setTimeout(() => {
      setIsLoading(false);
      setShowOtpInput(true);
      setCanResend(false);
      setCountdown(60);

      toast.success("Code sent!", {
        description: "Check your email for the 6-digit code.",
      });

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);

    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created!", {
        description: "Welcome to Pathible.",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    }, 1000);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtp("");
    handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  if (showOtpInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background to-card/30 px-4">
        <div className="w-full max-w-md bg-card rounded-xl p-10 shadow-lg space-y-6 border border-border/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowOtpInput(false);
              setOtp("");
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-crimson font-semibold text-foreground">
              Enter Code
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We sent a 6-digit code to{" "}
              <strong className="text-foreground">{email}</strong>
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

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center space-y-2">
              {!canResend ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in {countdown}s
                </p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  className="text-primary"
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background to-card/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <Image
              src="/pathible-logo.svg"
              alt="Pathible"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
          </Link>
          <h1 className="text-3xl font-crimson font-semibold text-foreground mb-2">
            Begin Your Legacy Journey
          </h1>
          <p className="text-muted-foreground">
            Create your account
            <br />
            and take the first step toward peace of mind
          </p>
        </div>

        <div className="bg-card rounded-xl p-8 shadow-lg space-y-6 border border-border/20">
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                We'll send you a 6-digit code to verify your email
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  Sending code...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative">
            <Separator className="my-6" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              Already have an account?
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Sign in instead
          </Button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed px-2">
            No password needed. We'll email you a secure code to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
