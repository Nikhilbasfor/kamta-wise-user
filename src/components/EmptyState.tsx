"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onClickAction?: () => void;
}

export default function EmptyState({
  title,
  subtitle,
  actionText,
  actionHref,
  onClickAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <h3 className="text-2xl font-light text-brand-charcoal mb-2 font-serif tracking-wide">{title}</h3>
      {subtitle && <p className="text-sm text-neutral-500 mb-8 max-w-md font-sans font-light leading-relaxed">{subtitle}</p>}
      
      {actionText && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-block px-8 py-3 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-[0.2em] hover:bg-brand-espresso transition-all duration-300 border border-brand-charcoal hover:border-brand-espresso"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onClickAction}
              className="px-8 py-3 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-[0.2em] hover:bg-brand-espresso transition-all duration-300 border border-brand-charcoal hover:border-brand-espresso"
            >
              {actionText}
            </button>
          )}
        </>
      )}
    </div>
  );
}
