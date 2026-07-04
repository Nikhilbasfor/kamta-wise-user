"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  text?: string;
}

export default function AddToCartButton({
  onClick,
  disabled = false,
  className = "",
  text = "Add to Cart",
}: AddToCartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 bg-brand-charcoal hover:bg-brand-espresso text-brand-cream text-xs uppercase tracking-[0.2em] font-sans py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 border border-brand-charcoal hover:border-brand-espresso disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingBag size={14} />
      {text}
    </button>
  );
}
