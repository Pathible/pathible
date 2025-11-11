"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex flex-col gap-4">
            <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Product</p>
            <Link
              href="/product/heritage-vault"
              onClick={handleClose}
              className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
            >
              Heritage Vault
            </Link>
            <Link
              href="/product/wisdom-education"
              onClick={handleClose}
              className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
            >
              Wisdom & Education
            </Link>
            <Link
              href="/product/legacy-planning"
              onClick={handleClose}
              className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
            >
              Legacy Planning
            </Link>
            <Link
              href="/product/financial-intelligence"
              onClick={handleClose}
              className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
            >
              Financial Intelligence
            </Link>
          </div>

          <Separator />

          <Link
            href="/pricing"
            onClick={handleClose}
            className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
          >
            Pricing
          </Link>

          <Button asChild className="btn-primary w-full">
            <Link href="/login" onClick={handleClose}>Sign in</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
