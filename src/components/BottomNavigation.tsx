"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { cart } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/",
    },
    {
      label: "Shop",
      icon: ShoppingBag,
      href: "/shop",
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      href: "/cart",
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-brand-taupe/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16 md:h-18 flex items-center justify-around px-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        const isCart = item.label === "Cart";

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative cursor-pointer ${
              active ? "text-brand-charcoal font-medium" : "text-neutral-500 hover:text-brand-espresso"
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              {isCart && mounted && totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-espresso text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fade-in">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span className="text-[9px] font-sans tracking-wider uppercase mt-1">
              {item.label}
            </span>
            {active && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-charcoal" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
