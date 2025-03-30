import React from "react";
import { Icons } from "../icons";
import Link from "next/link";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background w-full">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.logo className="h-6 w-6" />
          <span className="text-xl font-bold">Voice Studio</span>
        </div>
        <nav className="hidden md:flex items-center gap-16">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/signin">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
