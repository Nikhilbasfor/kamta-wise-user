"use client";

import React, { useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import AuthScreen from "./AuthScreen";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when pressing ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl z-10 border border-brand-taupe rounded-2xl animate-fade-in"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 z-20 p-2 text-neutral-400 hover:text-brand-charcoal transition-colors cursor-pointer"
          aria-label="Close authentication window"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="p-2">
          <AuthScreen isModal={true} />
        </div>
      </div>
    </div>
  );
}
