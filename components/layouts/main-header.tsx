"use client";

import { useUser } from "@clerk/nextjs";
import { Menu, X } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SignInButtonClerk } from "../clerk-sign-button/Sign-in-button";
import { ThemeSwitcher } from "../theme/mode-toggle";
import { CreditsDisplay } from "./credits-display";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Billing", href: "/billing" },
  { name: "Interview", href: "/interview" },
];

export function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useUser(); // ← drives credits visibility

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-14 transition-all duration-300 border-b",
          scrolled
            ? "border-black/6 dark:border-white/8 bg-white/60 dark:bg-background/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_2px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_30px_rgba(0,0,0,0.15)]"
            : "bg-transparent border-transparent",
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5">
          {/* LEFT — logo + separator + links */}
          <div className="flex h-full items-center">
            <Link href="/" className="flex items-center gap-2 pr-5">
              <Image
                src="/next.svg"
                alt="Clario AI"
                width={800}
                height={800}
                loading="eager"
                className="h-12 w-auto object-contain hidden dark:block"
              />
              <Image
                src="/next.svg"
                alt="Clario AI"
                width={800}
                height={800}
                loading="eager"
                className="h-12 w-auto object-contain dark:hidden block"
              />
            </Link>

            <div className="hidden h-5 w-px bg-black/10 dark:bg-white/10 lg:block" />

            {/* Desktop links */}
            <ul className="ml-5 hidden h-full items-center lg:flex">
              {menuItems.map((item) => (
                <li key={item.href} className="h-full">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex h-full items-center px-3.5 text-sm font-medium transition-colors duration-150",
                      isActive(item.href)
                        ? "text-[#161510] dark:text-white after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:rounded-t after:bg-[#c8d92e]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — credits (signed in only) + theme + separator + cta + mobile toggle */}
          <div className="flex items-center gap-2">
            {isSignedIn && (
              <div className="hidden lg:block">
                <CreditsDisplay />
              </div>
            )}

            <ThemeSwitcher />

            <div className="hidden h-5 w-px bg-black/10 dark:bg-white/10 lg:block" />

            <div className="hidden items-center gap-2 lg:flex">
              <SignInButtonClerk />
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <HugeiconsIcon icon={X} />
              ) : (
                <HugeiconsIcon icon={Menu} className="size-4.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-14 z-40 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-background/80 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-[#c8d92e]/10 text-[#8a9417] dark:text-[#c8d92e]"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
              {isSignedIn && <CreditsDisplay />}
              <SignInButtonClerk />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
