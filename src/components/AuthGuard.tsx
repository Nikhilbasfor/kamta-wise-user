"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import AuthScreen from "./AuthScreen";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center space-y-4">
        {/* Luxury minimalist spinner */}
        <div className="w-8 h-8 border-[1.5px] border-brand-charcoal border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-sans">
          Loading Collection
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
