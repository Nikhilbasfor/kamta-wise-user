"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface CategoryItem {
  name: string;
  displayName: string;
  image: string;
}

interface CategoryRowProps {
  categories: CategoryItem[];
}

export default function CategoryRow({ categories }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Show arrow if we haven't reached the end of the scrollable content
      setShowArrow(scrollLeft + clientWidth < scrollWidth - 15);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 pb-2">
      {/* Task 1B — Category Section Heading */}
      <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-brand-charcoal font-serif tracking-wide uppercase">
          Shop by Vibe
        </h3>
        <div className="h-1.5 w-24 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 mx-auto mt-4 rounded-full" />
      </div>

      {/* Task 1A — Category Slider with Scroll Indicator */}
      <div className="relative w-full group">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex flex-row items-center justify-start md:justify-center gap-6 sm:gap-10 md:gap-14 overflow-x-auto pb-6 pt-2 scrollbar-none"
        >
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center flex-shrink-0"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-brand-taupe/40 bg-brand-cream group-hover:border-brand-espresso group-hover:scale-105 transition-all duration-300 shadow-xs group-hover:shadow-md">
                <Image
                  src={cat.image}
                  alt={cat.displayName}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-sans mt-3 text-center group-hover:text-brand-espresso group-hover:font-medium transition-colors duration-300">
                {cat.displayName}
              </span>
            </Link>
          ))}
        </div>

        {/* Scroll indicator Arrow (centered relative to the circular icons) */}
        {showArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-[44px] z-10 w-9 h-9 rounded-full bg-white/90 border border-brand-taupe/40 shadow-md flex items-center justify-center text-brand-charcoal hover:text-brand-espresso hover:bg-white transition-all cursor-pointer"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        )}
      </div>
    </section>
  );
}
