"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface Slide {
  src: string;
  alt: string;
  objectFit: "object-cover" | "object-contain bg-white";
}

const defaultSlides: Slide[] = [
  {
    src: "/images/banner-main.jpg",
    alt: "Kamta Wise Branding Banner",
    objectFit: "object-contain bg-white"
  },
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    alt: "Minimalist Luxury Collection",
    objectFit: "object-cover"
  },
  {
    src: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&q=80",
    alt: "Premium Tailored Detail",
    objectFit: "object-cover"
  }
];

export default function HeroBanner() {
  const [activeSlides, setActiveSlides] = useState<Slide[]>(defaultSlides);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const docRef = doc(db, "siteSettings", "main");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.heroBanner && Array.isArray(data.heroBanner.slides) && data.heroBanner.slides.length > 0) {
            const parsedSlides = data.heroBanner.slides.map((s: any) => ({
              src: s.src || "/images/banner-main.jpg",
              alt: s.alt || "Kamta Wise Slide",
              objectFit: s.objectFit || "object-cover",
            }));
            setActiveSlides(parsedSlides);
          } else {
            setActiveSlides(defaultSlides);
          }
        } else {
          setActiveSlides(defaultSlides);
        }
        setIsLoaded(true);
      },
      (err) => {
        console.error("Error loading slides:", err);
        setIsLoaded(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
  };

  // Autoplay
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [activeSlides]);

  return (
    <section className="relative w-full animate-fade-in pt-8 md:pt-10 bg-brand-cream">
      {/* Main Banner Image Container - Bounded, Centered, Rounded, no crop/zoom, morph transition */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group overflow-hidden rounded-2xl border border-brand-taupe/30 bg-white aspect-[5/4] md:aspect-[1.25/1] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgba(0,0,0,0.18)] shadow-[0_15px_45px_rgba(0,0,0,0.1)]">
          
          {/* Morph Slides Wrapper */}
          <div className="relative w-full h-full overflow-hidden">
            {!isLoaded ? (
              <div className="w-full h-full bg-neutral-200 animate-pulse flex items-center justify-center text-neutral-400 text-xs uppercase tracking-widest font-sans">
                Loading banner...
              </div>
            ) : (
              activeSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                    currentIndex === idx
                      ? "opacity-100 scale-100 z-10 pointer-events-auto"
                      : "opacity-0 scale-105 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    unoptimized
                    className={`w-full h-full block ${slide.objectFit}`}
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    priority={idx === 0}
                  />
                </div>
              ))
            )}
          </div>

          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 hover:bg-white text-brand-charcoal hover:text-brand-espresso shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 hover:bg-white text-brand-charcoal hover:text-brand-espresso shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? "bg-brand-charcoal w-4" : "bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* CTA Buttons below banner */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-8 md:py-10 px-4 bg-brand-cream">
        <Link
          href="#new-arrivals"
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-charcoal text-white text-xs uppercase tracking-[0.2em] font-sans hover:bg-brand-espresso transition-all duration-300 shadow-sm text-center"
        >
          Shop New Arrivals
        </Link>
        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-brand-charcoal text-brand-charcoal text-xs uppercase tracking-[0.2em] font-sans hover:bg-brand-charcoal hover:text-white transition-all duration-300 text-center"
        >
          Explore Collection
        </Link>
      </div>
    </section>
  );
}
