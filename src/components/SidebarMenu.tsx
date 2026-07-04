"use client";

import React from "react";
import Link from "next/link";
import { X, Info, MessageSquare, HelpCircle, ShieldCheck, Sparkles, Ruler, ShoppingBag, ArrowRight } from "lucide-react";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  if (!isOpen) return null;

  const links = [
    { label: "Shop All Collection", href: "/shop", icon: ShoppingBag, desc: "Explore our quiet luxury garments" },
    { label: "About the Brand", href: "/profile?tab=about", icon: Info, desc: "Our roots, materials, and crafting story" },
    { label: "Contact Us", href: "/profile?tab=contact", icon: MessageSquare, desc: "Get in touch with Client Services" },
    { label: "Influencer Program", href: "/profile?tab=influencer", icon: Sparkles, desc: "Collaborate and create with us" },
    { label: "Shipping & Returns", href: "/profile?tab=shipping", icon: HelpCircle, desc: "Delivery timelines, returns and exchanges" },
    { label: "Size Guide", href: "/profile?tab=sizeguide", icon: Ruler, desc: "Find your perfect tailored fit" },
    { label: "FAQs", href: "/profile?tab=faq", icon: HelpCircle, desc: "Sourcing policies and shipping help" },
    { label: "Privacy & Terms", href: "/profile?tab=privacy", icon: ShieldCheck, desc: "Your data security and site terms" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-start overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-sm bg-brand-cream shadow-2xl flex flex-col h-full z-10 animate-slide-in-left border-r border-brand-taupe">
        {/* Header */}
        <div className="p-6 border-b border-brand-taupe/40 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <span className="text-xl font-light tracking-[0.2em] font-serif text-brand-charcoal uppercase">
              KAMTA WISE
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-brand-charcoal hover:text-brand-espresso transition-colors"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans px-3">
              Explore & Inform
            </span>
            <div className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-start gap-4 p-3 hover:bg-brand-beige/35 border border-transparent hover:border-brand-taupe/15 transition-all duration-300 group rounded-lg"
                  >
                    <div className="mt-0.5 p-1.5 bg-brand-beige/50 text-neutral-500 group-hover:text-brand-charcoal transition-colors rounded-md">
                      <Icon size={16} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-0.5 font-sans">
                      <span className="text-xs font-medium text-brand-charcoal uppercase tracking-wider block group-hover:text-brand-espresso transition-colors">
                        {link.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 block font-light leading-snug">
                        {link.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-taupe/45 bg-brand-beige/20 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-brand-charcoal">
            <span className="font-serif italic text-neutral-500">"Roots. Raw. Real."</span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400">© 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
