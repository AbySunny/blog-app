import { navItems } from "@/lib/constants";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import MobileNavigtaion from "./MobileNavigation";

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-serif font-bold text-foreground">
              Reasonance
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 ">
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>
          <MobileNavigtaion />
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
