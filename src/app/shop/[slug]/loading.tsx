import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-pulse bg-brand-cream min-h-screen">
      {/* Breadcrumbs Skeleton */}
      <div className="h-4 bg-brand-taupe/20 rounded w-1/4" />

      {/* Main product presentation layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-brand-taupe/20 rounded-2xl" />
          <div className="flex gap-2">
            <div className="w-16 h-20 bg-brand-taupe/20 rounded-lg" />
            <div className="w-16 h-20 bg-brand-taupe/20 rounded-lg" />
            <div className="w-16 h-20 bg-brand-taupe/20 rounded-lg" />
          </div>
        </div>

        {/* Right Column: Info Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-brand-taupe/20 rounded w-1/3" />
            <div className="h-8 bg-brand-taupe/20 rounded w-3/4" />
            <div className="h-6 bg-brand-taupe/20 rounded w-1/4" />
          </div>

          <hr className="border-brand-taupe/25" />

          {/* Selector Skeletons */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-brand-taupe/20 rounded w-1/6" />
              <div className="flex gap-2">
                <div className="w-12 h-8 bg-brand-taupe/20 rounded" />
                <div className="w-12 h-8 bg-brand-taupe/20 rounded" />
                <div className="w-12 h-8 bg-brand-taupe/20 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-brand-taupe/20 rounded w-1/6" />
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-taupe/20" />
                <div className="w-8 h-8 rounded-full bg-brand-taupe/20" />
              </div>
            </div>
          </div>

          {/* Button Skeletons */}
          <div className="space-y-3 pt-4">
            <div className="h-12 bg-brand-taupe/20 rounded-lg w-full" />
            <div className="h-10 bg-brand-taupe/20 rounded-lg w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
