"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import ProfileTabs from "@/components/ProfileTabs";
export default function ProfileClient() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "account";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Page Heading */}
      <SectionHeading
        title="Account & Brand Hub"
        subtitle="Manage your profile, orders, addresses, and explore Kamta Wise."
        align="center"
      />

      {/* Profile Tabs/Accordions */}
      <ProfileTabs initialTab={activeTab} />
    </div>
  );
}
