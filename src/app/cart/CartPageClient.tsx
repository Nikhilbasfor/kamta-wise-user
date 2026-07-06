"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import EmptyState from "@/components/EmptyState";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CartPageClient() {
  const router = useRouter();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    setIsCartDrawerOpen,
    setCheckoutStep,
    promoCode,
    setPromoCode,
    promoApplied,
    setPromoApplied,
  } = useStore();
  
  const { user, setIsAuthModalOpen } = useAuth();

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2999);
  const [loadingThreshold, setLoadingThreshold] = useState(true);

  // Fetch freeShippingThreshold from siteSettings/main
  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const docSnap = await getDoc(doc(db, "siteSettings", "main"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.shippingPolicy && typeof data.shippingPolicy.freeShippingThreshold === "number") {
            setFreeShippingThreshold(data.shippingPolicy.freeShippingThreshold);
          }
        }
      } catch (err) {
        console.error("Error loading shipping policy threshold:", err);
      } finally {
        setLoadingThreshold(false);
      }
    };
    fetchThreshold();
  }, []);

  const subtotal = cart.reduce(
    (acc, item) => acc + (item.product.discountedPrice ?? item.product.price) * item.quantity,
    0
  );

  const [appliedPromoDiscount, setAppliedPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const matchingItem = cart.find(
      (item) => item.product.promoCode && item.product.promoCode.trim().toUpperCase() === code
    );

    if (matchingItem) {
      const fixedDiscount = matchingItem.product.promoDiscount 
        ? Number(matchingItem.product.promoDiscount) * matchingItem.quantity
        : Math.round(((matchingItem.product.discountedPrice ?? matchingItem.product.price) * 0.15) * matchingItem.quantity);
      
      setAppliedPromoDiscount(fixedDiscount);
      setPromoApplied(true);
      setPromoMessage(`Promo code ${code} applied for ${matchingItem.product.name}! Saved ₹${fixedDiscount}.`);
    } else {
      alert(`Invalid promo code "${code}". Please use an active promo code configured for your cart items.`);
    }
  };

  const discountedSubtotal = promoApplied ? Math.max(0, subtotal - appliedPromoDiscount) : subtotal;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCheckoutClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setCheckoutStep("address");
      setIsCartDrawerOpen(true);
    }
  };

  const isFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className="bg-brand-cream min-h-screen text-brand-charcoal py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24 md:pb-32">
      <div className="max-w-6xl mx-auto space-y-8 pt-6">
        
        {/* Page Title */}
        <div className="border-b border-brand-taupe/20 pb-4">
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-wide text-brand-charcoal">
            Your Cart
          </h1>
          <p className="text-xs text-neutral-500 font-sans tracking-wider uppercase mt-1">
            Review your selected pieces and checkout below
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="Your cart is empty."
              subtitle="Explore our collections and find pieces designed to stand the test of time."
              actionText="Start Shopping"
              onClickAction={() => router.push("/shop")}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left Column: Cart Items list */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-white border border-brand-taupe/20 rounded-lg shadow-2xs hover:shadow-xs transition-shadow duration-300"
                >
                  {/* Item Image */}
                  <div className="relative w-24 h-32 bg-brand-beige overflow-hidden flex-shrink-0 rounded-md border border-neutral-100">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif text-lg font-light text-brand-charcoal leading-tight truncate hover:text-brand-espresso">
                          <Link href={`/shop/${item.product.slug || ""}`}>
                            {item.product.name}
                          </Link>
                        </h3>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                          }
                          className="text-neutral-400 hover:text-red-650 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>

                      <p className="text-xs text-neutral-500 font-sans mt-1 uppercase tracking-wider">
                        {item.selectedColor} / {item.selectedSize}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {item.product.discountedPrice ? (
                          <>
                            <span className="text-xs line-through text-neutral-400 font-light font-sans">
                              {formatPrice(item.product.price)}
                            </span>
                            <span className="text-sm font-semibold text-brand-espresso font-sans">
                              {formatPrice(item.product.discountedPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-sans text-brand-charcoal font-medium">
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center border border-brand-taupe bg-white rounded-md overflow-hidden">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity - 1
                            )
                          }
                          className="px-3 py-1.5 text-neutral-500 hover:text-brand-charcoal transition-colors hover:bg-neutral-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-sans font-light">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity + 1
                            )
                          }
                          className="px-3 py-1.5 text-neutral-500 hover:text-brand-charcoal transition-colors hover:bg-neutral-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="bg-white border border-brand-taupe/20 p-6 rounded-lg shadow-2xs space-y-6 lg:col-span-1">
              <h2 className="text-xl font-serif font-light text-brand-charcoal pb-3 border-b border-neutral-100">
                Order Summary
              </h2>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER PROMO CODE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-brand-taupe px-3 py-2 text-xs uppercase tracking-wider font-sans focus:outline-none focus:border-brand-espresso placeholder-neutral-405 rounded-md"
                  disabled={promoApplied}
                />
                <button
                  type="submit"
                  className="px-4 py-2 border border-brand-charcoal text-xs uppercase tracking-widest text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-cream transition-colors duration-300 disabled:opacity-50 rounded-md"
                  disabled={promoApplied}
                >
                  Apply
                </button>
              </form>

              {promoApplied && (
                <p className="text-xs text-emerald-700 font-sans flex justify-between items-center bg-emerald-50 p-2.5 rounded border border-emerald-200">
                  <span>{promoMessage || `Promo code ${promoCode.toUpperCase()} applied!`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoApplied(false);
                      setAppliedPromoDiscount(0);
                      setPromoCode("");
                    }}
                    className="underline text-neutral-550 hover:text-brand-charcoal ml-2 font-medium"
                  >
                    Remove
                  </button>
                </p>
              )}

              {/* Price calculations */}
              <div className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between font-sans font-light text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between font-sans font-light text-emerald-700">
                    <span>Promo Discount</span>
                    <span>-{formatPrice(appliedPromoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-sans font-light text-neutral-655">
                  <span>Shipping</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-medium">Free</span>
                    ) : (
                      "Calculated at checkout"
                    )}
                  </span>
                </div>

                {!isFreeShipping && !loadingThreshold && (
                  <p className="text-[11px] text-neutral-500 font-sans leading-tight">
                    Add <span className="font-semibold text-brand-charcoal">{formatPrice(freeShippingThreshold - subtotal)}</span> more to qualify for free shipping.
                  </p>
                )}

                <div className="flex justify-between font-serif text-base text-brand-charcoal pt-3 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="font-sans font-medium text-lg">
                    {formatPrice(discountedSubtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-brand-charcoal hover:bg-brand-espresso text-brand-cream py-3.5 text-xs uppercase tracking-[0.2em] font-sans transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded-md font-medium"
                >
                  Proceed to Checkout
                  <ArrowRight size={14} />
                </button>
                
                <Link
                  href="/shop"
                  className="block w-full text-center py-2 text-xs uppercase tracking-[0.15em] font-sans text-neutral-500 hover:text-brand-charcoal transition-colors duration-300 underline"
                >
                  Continue Shopping
                </Link>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
