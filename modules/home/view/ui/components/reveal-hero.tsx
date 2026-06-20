"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const BG_IMAGE_1 = "https://ik.imagekit.io/wbj1yk2cr/shoes/rt.jpeg";
const BG_IMAGE_2 = "https://ik.imagekit.io/wbj1yk2cr/shoes/56.jpeg";
const SPOTLIGHT_R = 260;
const SCROLL_THRESHOLD = 50;

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

// Cache gradient for better performance
const gradientCache = new Map<string, CanvasGradient>();

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastPosRef = useRef({ x: -999, y: -999 });

  const updateMask = useCallback(() => {
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!canvas || !reveal) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    // Skip if position hasn't changed meaningfully
    const dx = lastPosRef.current.x - cursorX;
    const dy = lastPosRef.current.y - cursorY;
    if (dx * dx + dy * dy < 16) return;

    lastPosRef.current = { x: cursorX, y: cursorY };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R,
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.75)");
    gradient.addColorStop(0.75, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(0.88, "rgba(255, 255, 255, 0.12)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL("image/png", 0.5);
    reveal.style.maskImage = `url(${dataUrl})`;
    reveal.style.webkitMaskImage = `url(${dataUrl})`;
    reveal.style.maskSize = "100% 100%";
    reveal.style.webkitMaskSize = "100% 100%";
  }, [cursorX, cursorY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(updateMask);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateMask]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        className="absolute inset-0 pointer-events-none"
      />
      <div
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none will-change-[mask-image]"
        style={{ backgroundImage: `url(${image})` }}
      />
    </>
  );
}

export default function RevealHero() {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [scrolled, setScrolled] = useState(false);
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);

  const updateCursor = useCallback(() => {
    smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.12;
    smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.12;

    setCursorPos({
      x: smoothRef.current.x,
      y: smoothRef.current.y,
    });

    rafRef.current = requestAnimationFrame(updateCursor);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateCursor]);

  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: "100dvh" }}
      >
        {/* Base Image Layer */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom will-change-transform"
          style={{
            backgroundImage: `url(${BG_IMAGE_1})`,
            transform: "translateZ(0)",
          }}
        />

        {/* Reveal Layer */}
        <RevealLayer
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
        />

        {/* Main Content Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 pointer-events-none z-50">
          {/* Heading */}
          <h1 className="text-white leading-[0.95] mb-6 sm:mb-8">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}
            >
              Master your
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}
            >
              next interview
            </span>
          </h1>

          {/* Combined Description & CTA */}
          <div
            className="flex flex-col items-center gap-7 sm:gap-8 hero-anim hero-fade pointer-events-auto max-w-2xl"
            style={{ animationDelay: "0.7s" }}
          >
            <p className="text-white/80 text-base sm:text-lg leading-relaxed px-4">
              Clario AI provides an immersive, interactive interview experience
              driven by advanced AI. Practice with tailored questions, get
              real-time feedback, and land your dream job with confidence.
            </p>
            <Link href="/interview">
            <Button
              type="button"
              className="bg-[#c8d92e] hover:bg-[#b5c528] text-[#161510] text-sm sm:text-base font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-[#c8d92e]/10 hover:shadow-[#c8d92e]/30"
            >
              Start Practicing
            </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
