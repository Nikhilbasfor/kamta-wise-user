"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
  itemCount?: number;
}

export default function CategoryCard({ name, image, href, itemCount }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/5] bg-brand-beige overflow-hidden border border-brand-taupe/15"
    >
      {/* Category Image */}
      <Image
        src={image}
        alt={`${name} Category`}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
      
      {/* Dim/Fade Overlay */}
      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-all duration-300" />

      {/* Text Container at bottom */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="space-y-1">
          {itemCount !== undefined && (
            <span className="text-[10px] text-brand-cream/80 uppercase tracking-widest font-sans font-light">
              {itemCount} Pieces
            </span>
          )}
          <h3 className="text-xl md:text-2xl font-light text-white font-serif tracking-wide flex items-center gap-2">
            {name}
            <ArrowRight
              size={16}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            />
          </h3>
        </div>
      </div>
    </Link>
  );
}
