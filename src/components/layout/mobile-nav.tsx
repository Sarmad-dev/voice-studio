"use client"
import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Icons } from "../icons";
import { navItems } from "@/constants/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Icons.menu />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Icons.logo className="h-6 w-6" />
              <span className="font-semibold">Voice Studio</span>
            </div>
          </SheetTitle>
          <SheetDescription className="hidden" />
        </SheetHeader>
        <div className="flex flex-col gap-1 px-4">
          {navItems.map((item) => (
            <SheetClose asChild>
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
