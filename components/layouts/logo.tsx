import React from "react";
import Link from "next/link";

const Logo = () => {
  return (
    <Link
      href="/"
      className="group flex items-center space-x-3 shrink-0 transition-all duration-300 hover:scale-[1.03]"
    >
      {/* Mark */}
      <div className="relative">
        {/* Base circle — ink in light mode, lime in dark mode, matching hero CTA */}
        <div className="w-10 h-10 rounded-full bg-[#161510] dark:bg-[#c8d92e] flex items-center justify-center shadow-xl shadow-[#161510]/15 dark:shadow-[#c8d92e]/25 group-hover:shadow-2xl group-hover:shadow-[#161510]/25 dark:group-hover:shadow-[#c8d92e]/40 transition-all duration-300 ring-2 ring-[#161510]/10 dark:ring-[#c8d92e]/20 group-hover:ring-[#c8d92e]/40">
          <span className="text-white dark:text-[#161510] font-semibold text-lg">
            C
          </span>
        </div>

        {/* Live indicator dot — same lime accent + pulse used in hero's "Live" badge */}
        <div className="absolute top-0 -left-2 w-1.5 h-1.5 bg-[#c8d92e] rounded-full shadow-sm shadow-[#c8d92e]/40 animate-ping" />
        <div className="absolute top-0 -left-2 w-1.5 h-1.5 bg-[#c8d92e] rounded-full" />

        {/* soft glow, single accent color, restrained like hero's ambient field */}
        <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#c8d92e] opacity-0 dark:opacity-15 blur-md group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-300" />
      </div>

      {/* Wordmark */}
      <div className="flex items-center">
        <span
          className="text-2xl font-semibold tracking-tight text-[#161510] dark:text-white group-hover:text-[#161510]/80 dark:group-hover:text-[#c8d92e] transition-colors duration-300"
          style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
        >
          Clario
        </span>
        <span className="ml-1.5 text-2xl font-light tracking-tight text-[#161510]/40 dark:text-white/40">
          AI
        </span>

        {/* Voice activity bars — kept from original concept, recolored to lime */}
        <div className="ml-3 flex items-center space-x-0.5">
          <div className="w-0.5 h-3 bg-[#c8d92e] rounded-full animate-pulse opacity-70" />
          <div className="w-0.5 h-5 bg-[#c8d92e] rounded-full animate-pulse delay-150 opacity-80" />
          <div className="w-0.5 h-4 bg-[#c8d92e] rounded-full animate-pulse delay-300 opacity-60" />
          <div className="w-0.5 h-6 bg-[#c8d92e] rounded-full animate-pulse delay-450 opacity-90" />
        </div>
      </div>
    </Link>
  );
};

export default Logo;