"use client";

import { useMutation } from "convex/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "../../ui/button";

interface WaitlistFormProps {
  variant?: "hero" | "cta";
}

export function WaitlistForm({ variant = "hero" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");
  const joinWaitlist = useMutation(api.waitlist.join);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setStatus("submitting");
    try {
      const result = await joinWaitlist({ email, product: "executor" });
      if (result.success) {
        setStatus("success");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 text-lg">
        <div className={variant === "cta" ? "text-white" : "text-pathible-forest"}>
          <Check className="w-5 h-5" />
        </div>
        <span className={variant === "cta" ? "text-white" : "text-foreground"}>
          You&apos;re on the list. We&apos;ll be in touch.
        </span>
      </div>
    );
  }

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className={`flex-1 rounded-xl px-4 text-base border focus:outline-none focus:ring-2 ${
            isHero
              ? "border-pathible-sage/30 bg-white focus:ring-pathible-forest/30"
              : "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:ring-white/30"
          }`}
        />
        <Button
          type="submit"
          disabled={status === "submitting"}
          size="lg"
          className={`rounded-xl px-6 py-3.5 text-base font-medium shadow-lg transition-all duration-300 ${
            isHero
              ? "bg-pathible-forest hover:bg-pathible-green-hover text-white shadow-pathible-forest/20 hover:shadow-xl hover:shadow-pathible-forest/30 hover:-translate-y-0.5"
              : "bg-white hover:bg-pathible-sand text-pathible-forest hover:shadow-xl hover:-translate-y-0.5"
          }`}
        >
          {status === "submitting" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Get Early Access
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <p className={`mt-3 text-sm ${isHero ? "text-muted-foreground" : "text-white/50"}`}>
        No credit card required. We&apos;ll notify you when it&apos;s ready.
      </p>
    </form>
  );
}
