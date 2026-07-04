import React, { Suspense } from "react";
import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Client Profile & Brand Hub | Kamta Wise",
    description: "Manage your personal profile details, track recent orders, configure shipping addresses, and access size guides and policies.",
    openGraph: {
      title: "Client Profile & Brand Hub | Kamta Wise",
      description: "Manage your personal profile details, track recent orders, configure shipping addresses, and access size guides and policies.",
      url: "https://www.kamtawise.in/profile",
    }
  };
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-brand-cream text-brand-charcoal font-sans text-xs uppercase tracking-[0.2em]">
          Loading Profile...
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}
