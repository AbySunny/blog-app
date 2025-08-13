"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { navItems } from "@/lib/constants";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MobileNavigtaion() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; username: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      if (mounted) setUser(data?.user ?? null);
    }
    load();
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => { mounted = false; document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <div className="md:hidden flex items-center space-x-4">
      <ThemeToggle />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle></SheetTitle>
          <div className="flex flex-col space-y-4 mt-8 p-8">
            {navItems.map((item) => {
              if (item.href === "/notifications" && !user) {
                return null;
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}


