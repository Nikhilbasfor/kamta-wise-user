"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/data/products";

import { useAuth } from "@/context/AuthContext";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  iconSize?: number;
}

export default function WishlistButton({
  product,
  className = "",
  iconSize = 18,
}: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useStore();
  const { user, setIsAuthModalOpen } = useAuth();
  const active = isInWishlist(product.id);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!user) {
          setIsAuthModalOpen(true);
        } else {
          toggleWishlist(product);
        }
      }}
      className={`p-3 border transition-colors duration-300 flex items-center justify-center ${
        active
          ? "border-brand-charcoal bg-brand-charcoal text-brand-cream"
          : "border-brand-taupe hover:border-brand-charcoal text-brand-charcoal"
      } ${className}`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={iconSize} fill={active ? "currentColor" : "none"} strokeWidth={1.5} />
    </button>
  );
}
