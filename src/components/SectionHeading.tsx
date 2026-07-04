"use client";

import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  const alignClass = align === "left" ? "text-left" : "text-center mx-auto";
  
  return (
    <div className={`mb-10 md:mb-14 max-w-2xl ${alignClass} animate-fade-in`}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-brand-charcoal tracking-wide mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base font-light text-neutral-500 font-sans tracking-wide leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`h-1.5 w-24 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 mt-5 rounded-full ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
