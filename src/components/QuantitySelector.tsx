"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  className?: string;
}

export default function QuantitySelector({
  quantity,
  onChange,
  className = "",
}: QuantitySelectorProps) {
  return (
    <div className={`flex items-center border border-brand-taupe bg-white ${className}`}>
      <button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="px-3 py-2 text-neutral-500 hover:text-brand-charcoal transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-xs font-sans font-light select-none">{quantity}</span>
      <button
        onClick={() => onChange(quantity + 1)}
        className="px-3 py-2 text-neutral-500 hover:text-brand-charcoal transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
