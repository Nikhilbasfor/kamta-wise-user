"use client";

import React from "react";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onChange: (size: string) => void;
  className?: string;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onChange,
  className = "",
}: SizeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-sans">
          Size: <span className="text-brand-charcoal font-medium">{selectedSize || "Select"}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`min-w-[42px] h-[42px] px-3 border text-xs font-sans tracking-wider transition-all duration-200 flex items-center justify-center ${
              selectedSize === size
                ? "border-brand-charcoal bg-brand-charcoal text-brand-cream"
                : "border-brand-taupe hover:border-brand-charcoal text-brand-charcoal bg-white"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
