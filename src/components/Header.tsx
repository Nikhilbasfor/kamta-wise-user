"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, Bookmark, Search, User as UserIcon } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import SidebarMenu from "./SidebarMenu";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, wishlist, setIsCartDrawerOpen } = useStore();
  const { user, setIsAuthModalOpen } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [announcement, setAnnouncement] = useState<{ text: string; isActive: boolean } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const docRef = doc(db, "siteSettings", "main");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.announcementBar) {
            setAnnouncement(data.announcementBar);
          }
        }
      },
      (err) => {
        console.error("Error loading announcement:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Monitor page scroll to apply border styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search/mobile menu on route change
  useEffect(() => {
    setIsSearchOpen(false);
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b border-neutral-800 ${
          scrolled
            ? "bg-brand-charcoal/95 backdrop-blur-md py-3 shadow-2xs"
            : "bg-brand-charcoal py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Golden Logo with Text & Sidebar Menu Button */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-neutral-300 hover:text-white hover:scale-105 transition-all flex items-center cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <Image
                src="/logo.png"
                alt="Kamta Wise"
                width={56}
                height={56}
                className={`w-auto object-contain transition-all duration-300 ${
                  scrolled ? "h-9 sm:h-10 md:h-12" : "h-11 sm:h-12 md:h-14"
                }`}
                priority
              />
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-[0.2em] font-serif text-brand-cream uppercase select-none whitespace-nowrap ml-1 sm:ml-2">
                Kamta Wise
              </span>
            </Link>
          </div>

          {/* Right: Search & Saved/Wishlist icons only */}
          <div className="flex items-center space-x-3">
            {/* User Account / Sign In */}
            {mounted && (!user ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-300 hover:text-white transition-colors font-sans mr-1 cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <Link
                href="/profile?tab=account"
                className={`p-1.5 transition-colors flex items-center ${
                  isActive("/profile") ? "text-brand-cream" : "text-neutral-300 hover:text-white"
                }`}
                aria-label="User profile"
              >
                <UserIcon size={18} strokeWidth={1.5} />
              </Link>
            ))}

            {/* Shopping Bag Icon Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors flex items-center relative cursor-pointer"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {mounted && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-espresso text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Saved/Wishlist Bookmark Icon */}
            <Link
              href="/wishlist"
              className={`p-1.5 transition-colors flex items-center relative ${
                isActive("/wishlist") ? "text-brand-cream" : "text-neutral-300 hover:text-white"
              }`}
              aria-label="Wishlist items"
            >
              <Bookmark size={18} strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-espresso text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors flex items-center cursor-pointer"
              aria-label="Search products"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Collapsible Search Overlay Bar */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-brand-charcoal border-y border-neutral-800 py-4 px-4 shadow-sm animate-fade-in animate-duration-200">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center">
              <input
                type="text"
                placeholder="Search collection (e.g. linen, silk, trench)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm font-sans font-light py-2 px-3 focus:outline-none border-b border-neutral-700 focus:border-brand-cream text-brand-cream placeholder-neutral-500"
                autoFocus
              />
              <button
                type="submit"
                className="ml-3 px-4 py-2 bg-brand-cream text-brand-charcoal text-xs uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="ml-2 p-2 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Moving User Greeting + Free Shipping Announcement Banner */}
      {mounted && pathname === "/" && (
        <>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-33.333%, 0, 0); }
            }
            .animate-marquee-custom {
              display: inline-block;
              white-space: nowrap;
              animation: marquee 25s linear infinite;
            }
            .animate-marquee-custom:hover {
              animation-play-state: paused;
            }
          `}} />
          <div className="w-full bg-white text-black py-2 border-b border-neutral-200 z-30 relative shadow-sm font-sans overflow-hidden whitespace-nowrap flex items-center">
            <div className="animate-marquee-custom uppercase tracking-[0.15em] text-[9px] xs:text-[10px] sm:text-xs font-semibold select-none">
              {(() => {
                const announcementText = announcement?.isActive ? announcement.text : "FREE SHIPPING ON ALL ORDERS";
                const bannerText = user 
                  ? `HI, ${user?.displayName || "MEMBER"} — WELCOME TO KAMTA WISE • ${announcementText} • `
                  : `WELCOME TO KAMTA WISE • ${announcementText} • `;
                return (
                  <>
                    <span className="inline-block mr-16">{bannerText}</span>
                    <span className="inline-block mr-16">{bannerText}</span>
                    <span className="inline-block mr-16">{bannerText}</span>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* Sidebar Navigation Drawer */}
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
