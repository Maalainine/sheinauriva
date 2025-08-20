"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const BRAND_IMAGES = [
  "/images/brands/adidas-seeklogo.png",
  "/images/brands/bershka-seeklogo.png",
  "/images/brands/gucci-seeklogo.png",
  "/images/brands/hermes-seeklogo.png",
  "/images/brands/lc-waikiki-seeklogo.png",
  "/images/brands/nike-seeklogo.png",
  "/images/brands/pull-bear-seeklogo.png",
  "/images/brands/puma-seeklogo.png",
  "/images/brands/the-north-face-seeklogo.png",
  "/images/brands/zara-seeklogo.png"
];

// Duplicate the array to create a seamless loop
duplicateArray(BRAND_IMAGES, 2);

function duplicateArray(arr: string[], times: number) {
  for (let i = 0; i < times; i++) {
    arr.push(...arr);
  }
  return arr;
}

export function BrandLogos() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const scrollAmount = useRef(0);
  const scrollSpeed = 1; // Adjust speed here (lower is slower)

  useEffect(() => {
    if (!scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    const containerWidth = scrollContainer.scrollWidth / 2; // Since we duplicated the array

    const animate = () => {
      if (!scrollRef.current) return;
      
      scrollAmount.current += scrollSpeed;
      
      // Reset scroll position to create infinite loop
      if (scrollAmount.current >= containerWidth) {
        scrollAmount.current = 0;
      }
      
      scrollRef.current.style.transform = `translateX(-${scrollAmount.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="w-full overflow-hidden">
      <div className="relative w-full overflow-hidden" ref={containerRef}>
        <div
          ref={scrollRef}
          className="flex w-max items-center gap-8 px-4"
          style={{
            willChange: 'transform',
            transform: 'translateX(0px)',
          }}
        >
          {BRAND_IMAGES.map((src, index) => (
            <div
              key={`${index}-${src}`}
              className={cn(
                "flex h-auto w-32 my-4 shrink-0 items-center justify-center",
                "transition-opacity duration-300 hover:opacity-100",
                "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt="Brand logo"
                width={100}
                height={100}
                className="h-auto max-w-[120px] object-contain"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-logo.svg';
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Gradient fade effect on the sides */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
