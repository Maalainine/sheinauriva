"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface CenterFocusedCarouselProps {
  children: ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

export function CenterFocusedCarousel({
  children,
  autoPlay = true,
  autoPlayInterval = 5000,
  cardWidth = 280,
  cardHeight = 420,
  className = "",
}: CenterFocusedCarouselProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isDragging && autoPlay && children.length > 1) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isDragging, children.length, autoPlay, autoPlayInterval]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
  }, [children.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % children.length);
  }, [children.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch/Mouse handlers
  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const diff = clientX - startX;
      setTranslateX(diff);
    },
    [isDragging, startX],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const threshold = 100;
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    setIsDragging(false);
    setTranslateX(0);
  }, [isDragging, translateX, goToPrevious, goToNext]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX);
    },
    [handleStart],
  );

  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX);
    },
    [handleStart],
  );

  const handleGlobalTouchMove = useCallback(
    (e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove],
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Add global mouse/touch events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleGlobalTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    handleGlobalMouseMove,
    handleMouseUp,
    handleGlobalTouchMove,
    handleTouchEnd,
  ]);

  const getItemStyle = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    const normalizedDistance = Math.min(distance, 2);

    // Enhanced scaling and effects
    const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.8;
    const opacity = distance === 0 ? 1 : distance === 1 ? 0.7 : 0.4;

    // Dynamic spacing based on card width with extra gap
    const gap = 60; // Even larger gap between cards (5rem)
    const baseOffset = (index - currentIndex) * (cardWidth * 0.8 + gap);
    const dragOffset = isDragging ? translateX : 0;

    return {
      transform: `translateX(${baseOffset + dragOffset}px) scale(${scale})`,
      opacity: opacity,
      zIndex: 10 - distance,
      transition: isDragging
        ? "none"
        : "all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)",
      margin: "0 24px", // Even larger horizontal margin for maximum spacing
    };
  };

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
        <p className="text-gray-500 text-lg">No items available</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full max-w-7xl mx-auto ${className} overflow-hidden`}
    >
      <div
        className="relative"
        style={{
          height: cardHeight + 100,
          overflow: "hidden",
          width: "100%",
        }}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            userSelect: "none",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="absolute will-change-transform pointer-events-auto"
              style={{
                ...getItemStyle(index),
                width: cardWidth,
                height: cardHeight,
              }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Now visible on all screen sizes */}
        {children.length > 1 && (
          <>
            <Button
              onClick={goToPrevious}
              variant="outline"
              size="icon"
              className="flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full items-center justify-center z-20 transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100"
              aria-label="Previous"
            >
              <IconChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            <Button
              onClick={goToNext}
              variant="outline"
              size="icon"
              className="flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full items-center justify-center z-20 transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100"
              aria-label="Next"
            >
              <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {children.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {React.Children.map(children, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CenterFocusedCarousel;
