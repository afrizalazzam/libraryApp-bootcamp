"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen, Compass, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  image?: string;
  icon?: LucideIcon;
  title: string;
  subtitle: string;
};

const slides: Slide[] = [
  {
    image: "/slides-1.png",
    title: "Welcome to Booky",
    subtitle: "Your next favorite book is just a click away.",
  },
  {
    icon: Compass,
    title: "Discover Your Next Read",
    subtitle: "Explore thousands of titles across every genre.",
  },
  {
    icon: BookOpen,
    title: "Borrow Anytime, Anywhere",
    subtitle: "Reserve and borrow books in just a few taps.",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative aspect-[2400/882] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#5B93F0] via-[#8CB9F5] to-[#EAF3FF]">
        {slides.map((slide, index) => (
          <Slide key={slide.title} slide={slide} isActive={index === active} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "size-2 rounded-full transition-colors",
              index === active ? "bg-primary" : "bg-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Slide({ slide, isActive }: { slide: Slide; isActive: boolean }) {
  const Icon = slide.icon;

  if (slide.image) {
    return (
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          isActive ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <Image
          src={slide.image}
          alt={slide.title}
          width={2400}
          height={882}
          priority
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center transition-opacity duration-700 sm:gap-4",
        isActive ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <span className="absolute top-10 left-12 size-24 rounded-full bg-white/30 blur-2xl" />
      <span className="absolute right-16 bottom-8 size-32 rounded-full bg-white/25 blur-2xl" />
      <span className="absolute top-1/3 right-1/4 size-16 rounded-full bg-white/20 blur-xl" />

      {Icon && (
        <Icon className="relative size-6 text-white/90 sm:size-12" strokeWidth={1.75} />
      )}

      <h2
        className="relative text-lg font-bold text-white sm:text-display-lg"
        style={{
          textShadow:
            "-2px -2px 0 var(--color-primary-600), 2px -2px 0 var(--color-primary-600), -2px 2px 0 var(--color-primary-600), 2px 2px 0 var(--color-primary-600), 0 4px 12px rgba(28,101,218,0.35)",
        }}
      >
        {slide.title}
      </h2>
      <p className="relative hidden max-w-md text-lg font-medium text-white/95 sm:block">
        {slide.subtitle}
      </p>
    </div>
  );
}
