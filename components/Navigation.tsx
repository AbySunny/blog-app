"use client";

import { navItems } from "@/lib/constants";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import MobileNavigtaion from "./MobileNavigation";
import { useEffect, useState } from "react";

function Navigation() {
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

  async function handleSignOut() {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      window.location.reload();
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-serif font-bold text-foreground">Reasonance</h1>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.href === "/signin") {
                return user ? (
                  <button
                    key="signout"
                    onClick={handleSignOut}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 "
                  >
                    {item.name}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 "
                >
                  {item.name}
                </Link>
              );
            })}
            <ThemeToggle />
          </div>

          {/* Mobile: add sign in/out + menu */}
          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/signin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
            <MobileNavigtaion />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
