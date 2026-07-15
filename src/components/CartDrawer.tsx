"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import Image from "next/image";
import EmptyState from "./EmptyState";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export default function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkoutStep,
    setCheckoutStep,
    promoCode,
    setPromoCode,
    promoApplied,
    setPromoApplied,
  } = useStore();
  const { user, profile, addOrder, setIsAuthModalOpen } = useAuth();

  useEffect(() => {
    setIsCartDrawerOpen(false);
  }, [pathname, setIsCartDrawerOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cashfreeOrderId = params.get("cashfree_order_id");
      
      if (cashfreeOrderId) {
        // Clear the query parameter from URL so it doesn't run again on reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // Verify the payment status
        verifyPayment(cashfreeOrderId);
      }
    }
  }, []);

  // Checkout flow states
  const [addressOption, setAddressOption] = useState<"saved" | "new">("saved");
  const [customAddress, setCustomAddress] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPincode, setAddressPincode] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  const isCodAllowedForCart = cart.every(item => item.product.isCodAllowed !== false);

  useEffect(() => {
    if (!isCodAllowedForCart) {
      setPaymentMethod("online");
    }
  }, [isCodAllowedForCart]);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<any>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [appliedPromoDiscount, setAppliedPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>("");
  const [promoError, setPromoError] = useState<string>("");

  // Initialize defaults
  useEffect(() => {
    if (isCartDrawerOpen) {
      if (profile) {
        setCustomPhone(profile.phone || "");
        if (profile.address) {
          setAddressOption("saved");
        } else {
          setAddressOption("new");
        }
      }
    } else {
      setCheckoutStep("cart");
    }
  }, [isCartDrawerOpen, profile, setCheckoutStep]);

  const handleCheckoutClick = () => {
    if (!user) {
      setIsCartDrawerOpen(false);
      setIsAuthModalOpen(true);
    } else {
      setCheckoutStep("address");
    }
  };

  const verifyPayment = async (orderId: string) => {
    setIsCartDrawerOpen(true);
    setCheckoutStep("address");
    setPlacingOrder(true);
    
    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        await new Promise<void>((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((u) => {
            currentUser = u;
            unsubscribe();
            resolve();
          });
        });
      }

      if (!currentUser) {
        alert("Authentication required to verify payment. Please log in.");
        setPlacingOrder(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/cashfree/verify-order?orderId=${orderId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.paymentStatus === "SUCCESS") {
        const pendingDocRef = doc(db, "pendingOrders", currentUser.uid);
        const pendingDoc = await getDoc(pendingDocRef);
        
        if (pendingDoc.exists()) {
          const newOrder = pendingDoc.data();
          
          if (newOrder.cashfreeOrderId === orderId) {
            await addOrder(newOrder);

            // Send automated confirmation email using Resend
            fetch("/api/send-order-email", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                orderNumber: newOrder.orderNumber,
                customerEmail: currentUser.email,
                customerName: profile?.name || currentUser.displayName,
                items: newOrder.items,
                total: newOrder.total,
                address: newOrder.address,
                phone: newOrder.phone,
              }),
            }).catch((err) => console.error("Email send failed:", err));

            setPlacedOrderInfo(newOrder);
            clearCart();
            setPromoCode("");
            setPromoApplied(false);
            setCheckoutStep("success");

            await deleteDoc(pendingDocRef);
          } else {
            alert("Payment verified, but local checkout session expired. Please contact support.");
          }
        } else {
          alert("Order recovery: Payment was successful, but we could not find your pending order details in our database. Please contact Kamta Wise support with Cashfree Order ID: " + orderId + " to recover your order.");
        }
      } else {
        alert("Payment was not successful (Status: " + (data.orderStatus || "FAILED") + "). Please try again.");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify payment status. Please contact support.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    let finalAddress = "";
    if (addressOption === "saved") {
      finalAddress = profile?.address || "";
    } else {
      if (!addressStreet.trim()) {
        alert("Please enter Flat/House No, Building & Street name.");
        return;
      }
      if (!addressCity.trim()) {
        alert("Please enter City or District.");
        return;
      }
      if (!addressState.trim()) {
        alert("Please select your State.");
        return;
      }
      if (!addressPincode.trim() || addressPincode.trim().length !== 6 || isNaN(Number(addressPincode))) {
        alert("Please enter a valid 6-digit Pincode.");
        return;
      }
      finalAddress = `${addressStreet.trim()}${addressLandmark.trim() ? `, ${addressLandmark.trim()}` : ""}, ${addressCity.trim()}, ${addressState.trim()} - ${addressPincode.trim()}`;
    }
    const finalPhone = customPhone;

    if (!finalAddress.trim()) {
      alert("Please enter a valid shipping address.");
      return;
    }
    if (!finalPhone.trim()) {
      alert("Please enter a valid contact phone number.");
      return;
    }

    setPlacingOrder(true);
    try {
      const token = user ? await user.getIdToken() : "";
      const orderSubtotal = cart.reduce((acc, item) => acc + (item.product.discountedPrice ?? item.product.price) * item.quantity, 0);
      const orderDiscountedSubtotal = promoApplied ? orderSubtotal * 0.9 : orderSubtotal;
      const generatedOrderNumber = `KW-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (paymentMethod === "cod") {
        const newOrder = {
          orderNumber: "#" + generatedOrderNumber,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          status: "Processing",
          paymentStatus: "Cash on Delivery",
          cashfreeOrderId: "",
          total: orderDiscountedSubtotal,
          address: finalAddress,
          phone: finalPhone,
          items: cart,
        };

        await addOrder(newOrder);

        // Send automated confirmation email using Resend
        fetch("/api/send-order-email", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            orderNumber: newOrder.orderNumber,
            customerEmail: user?.email,
            customerName: profile?.name || user?.displayName,
            items: newOrder.items,
            total: newOrder.total,
            address: newOrder.address,
            phone: newOrder.phone,
            paymentMethod: "Cash on Delivery",
          }),
        }).catch((err) => console.error("Email send failed:", err));

        setPlacedOrderInfo(newOrder);
        clearCart();
        setPromoCode("");
        setPromoApplied(false);
        setCheckoutStep("success");
        setPlacingOrder(false);
        return;
      }

      // Store checkout state in Firestore
      const pendingOrder = {
        orderNumber: "#" + generatedOrderNumber,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        status: "Processing",
        paymentStatus: "Paid via Cashfree",
        cashfreeOrderId: generatedOrderNumber,
        total: orderDiscountedSubtotal,
        address: finalAddress,
        phone: finalPhone,
        items: cart,
      };
      if (user) {
        await setDoc(doc(db, "pendingOrders", user.uid), pendingOrder, { merge: true });
      }

      // Request Cashfree order session from our Next.js API route
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: generatedOrderNumber,
          orderAmount: orderDiscountedSubtotal,
          customerDetails: {
            customerId: user?.uid || "guest",
            customerName: profile?.name || user?.displayName || "Customer",
            customerEmail: user?.email || "guest@kamtawise.in",
            customerPhone: finalPhone,
          },
          returnUrl: `${window.location.origin}/?cashfree_order_id=${generatedOrderNumber}`,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to create payment session.");
      }

      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId: resData.payment_session_id,
        redirectTarget: "_self",
      });

    } catch (err: any) {
      console.error("Cashfree order initialization failed:", err);
      alert(err.message || "Failed to initiate Cashfree payment. Please try again.");
      setPlacingOrder(false);
    }
  };

  const handleStartShopping = () => {
    setIsCartDrawerOpen(false);
    if (user) {
      router.push("/shop");
    } else {
      router.push("/profile");
    }
  };

  if (!isCartDrawerOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.product.discountedPrice ?? item.product.price) * item.quantity, 0);

  const uniquePromosMap = new Map();
  cart.forEach(item => {
    const p = item.product;
    if (p.promoCode && p.promoCode.trim() !== "") {
      uniquePromosMap.set(p.promoCode.trim().toUpperCase(), {
        code: p.promoCode.trim().toUpperCase(),
        discount: p.promoDiscount || 0,
        productName: p.name
      });
    }
  });
  const availablePromos = Array.from(uniquePromosMap.values());

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    setPromoError("");

    // Check if code matches any product in cart
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
      setPromoError(`Invalid promo code "${code}". Try one of the suggested codes.`);
    }
  };

  const discountedSubtotal = Math.max(0, subtotal - appliedPromoDiscount);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-brand-cream shadow-xl flex flex-col h-full z-10 animate-fade-in border-l border-brand-taupe">
        {/* Header */}
        <div className="p-6 border-b border-brand-taupe flex items-center justify-between">
          <h2 className="text-xl font-light tracking-wide font-serif text-brand-charcoal">
            {checkoutStep === "cart" && "Your Cart"}
            {checkoutStep === "address" && "Confirm Order Destination"}
            {checkoutStep === "success" && "Order Completed"}
          </h2>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1 hover:text-brand-espresso transition-colors"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Step 1: Cart View */}
        {checkoutStep === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <EmptyState
                    title="Your cart is empty."
                    subtitle="Explore our collections and find pieces designed to stand the test of time."
                    actionText="Start Shopping"
                    onClickAction={handleStartShopping}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                      className="flex items-start gap-4 pb-6 border-b border-neutral-100 last:border-0 last:pb-0"
                    >
                      <div className="relative w-20 h-24 bg-brand-beige overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base font-light text-brand-charcoal leading-tight truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-neutral-500 font-sans mt-1">
                          {item.selectedColor} / {item.selectedSize}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
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
                            <span className="text-sm font-sans text-brand-charcoal">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-brand-taupe bg-white">
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedColor,
                                  item.quantity - 1
                                )
                              }
                              className="px-2 py-1 text-neutral-500 hover:text-brand-charcoal transition-colors"
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
                              className="px-2 py-1 text-neutral-500 hover:text-brand-charcoal transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                            }
                            className="text-neutral-400 hover:text-red-600 transition-colors ml-auto"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-brand-taupe bg-brand-beige/30 space-y-4">
                {/* Promo code */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER PROMO"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError("");
                    }}
                    className="flex-1 bg-white border border-brand-taupe px-3 py-2 text-xs uppercase tracking-wider font-sans focus:outline-none focus:border-brand-espresso"
                    disabled={promoApplied}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 border border-brand-charcoal text-xs uppercase tracking-widest text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-cream transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                    disabled={promoApplied}
                  >
                    Apply
                  </button>
                </form>

                {promoError && (
                  <p className="text-[11px] text-red-600 font-sans tracking-wide mt-1">
                    {promoError}
                  </p>
                )}

                {/* Show active promos in cart */}
                {availablePromos.length > 0 && !promoApplied && (
                  <div className="text-[10px] text-neutral-500 font-sans tracking-wide space-y-1 pt-1">
                    <span className="uppercase text-[9px] font-semibold text-brand-charcoal block">Active Promos for items in your cart:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {availablePromos.map((p: any) => (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => {
                            setPromoCode(p.code);
                            setPromoError("");
                          }}
                          className="bg-brand-cream border border-brand-taupe/80 hover:border-brand-espresso hover:text-brand-charcoal px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition-colors duration-200 cursor-pointer font-medium text-neutral-600"
                        >
                          {p.code} (Save ₹{p.discount})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {promoApplied && (
                  <p className="text-xs text-emerald-705 font-sans flex items-center justify-between bg-emerald-50/50 border border-emerald-200/60 p-2.5 rounded-lg">
                    <span>{promoMessage || "Promo code applied!"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoApplied(false);
                        setAppliedPromoDiscount(0);
                        setPromoMessage("");
                        setPromoCode("");
                      }}
                      className="underline text-emerald-800 hover:text-emerald-950 text-[10px] uppercase font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </p>
                )}

                {/* Calculations */}
                <div className="space-y-2 pt-2 text-sm">
                  <div className="flex justify-between font-sans font-light text-neutral-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between font-sans font-medium text-emerald-700">
                      <span>Promo Discount</span>
                      <span>-{formatPrice(appliedPromoDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-serif text-base text-brand-charcoal pt-2 border-t border-brand-taupe">
                    <span>Total</span>
                    <span className="font-sans font-medium">{formatPrice(discountedSubtotal)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 font-sans text-center">
                  Shipping and taxes calculated at checkout.
                </p>

                {/* CTA Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-brand-charcoal hover:bg-brand-espresso text-brand-cream py-3.5 text-xs uppercase tracking-[0.2em] font-sans transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Proceed to Checkout
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="w-full text-center py-2 text-xs uppercase tracking-[0.15em] font-sans text-neutral-500 hover:text-brand-charcoal transition-colors duration-300"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Address Selection View */}
        {checkoutStep === "address" && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Phone number confirmation */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans block">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 text-xs font-sans font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full pl-11 pr-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Address Selection options */}
              <div className="space-y-4 pt-2">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans block">
                  Select Delivery Address
                </label>

                {/* Option 1: Saved Address */}
                {profile?.address ? (
                  <label className="flex items-start gap-3 p-4 border border-brand-taupe/40 bg-white rounded-lg cursor-pointer hover:bg-brand-cream/20">
                    <input
                      type="radio"
                      name="addressOption"
                      checked={addressOption === "saved"}
                      onChange={() => setAddressOption("saved")}
                      className="mt-1 accent-brand-charcoal"
                    />
                    <div className="space-y-1 font-sans">
                      <span className="text-xs font-bold text-brand-charcoal">Use Saved Default Address</span>
                      <p className="text-[11px] text-neutral-500 leading-relaxed whitespace-pre-line">
                        {profile.address}
                      </p>
                    </div>
                  </label>
                ) : (
                  <p className="text-[11px] text-amber-700 italic font-sans">No saved address found. Please enter a shipping address below.</p>
                )}

                {/* Option 2: New Address */}
                <label className="flex items-start gap-3 p-4 border border-brand-taupe/40 bg-white rounded-lg cursor-pointer hover:bg-brand-cream/20">
                  <input
                    type="radio"
                    name="addressOption"
                    checked={addressOption === "new"}
                    onChange={() => setAddressOption("new")}
                    className="mt-1 accent-brand-charcoal"
                  />
                  <div className="space-y-2 flex-1 font-sans">
                    <span className="text-xs font-bold text-brand-charcoal">Deliver to a different address</span>
                    {addressOption === "new" && (
                      <div className="space-y-2.5 mt-2 pt-2 border-t border-brand-taupe/20">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block mb-1">
                            Flat No, Building, Street *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Flat 101, Sunshine Apartments, Main Road"
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                            className="w-full p-2 bg-brand-cream/35 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans text-brand-charcoal"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block mb-1">
                            Area, Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Near Central Park"
                            value={addressLandmark}
                            onChange={(e) => setAddressLandmark(e.target.value)}
                            className="w-full p-2 bg-brand-cream/35 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans text-brand-charcoal"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block mb-1">
                              City / District *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Mumbai"
                              value={addressCity}
                              onChange={(e) => setAddressCity(e.target.value)}
                              className="w-full p-2 bg-brand-cream/35 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans text-brand-charcoal"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block mb-1">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. 400001"
                              value={addressPincode}
                              onChange={(e) => setAddressPincode(e.target.value)}
                              className="w-full p-2 bg-brand-cream/35 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans text-brand-charcoal"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block mb-1">
                            State *
                          </label>
                          <select
                            value={addressState}
                            onChange={(e) => setAddressState(e.target.value)}
                            className="w-full p-2 bg-brand-cream/35 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans text-brand-charcoal appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_8px_center] bg-no-repeat pr-8"
                          >
                            <option value="">Select State</option>
                            {[
                              "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
                              "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
                              "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
                              "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
                              "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
                              "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                            ].map((stateName) => (
                              <option key={stateName} value={stateName}>{stateName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4 pt-4 border-t border-brand-taupe/20">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans block">
                  Select Payment Method
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Online Payment */}
                  <label className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-brand-cream/10 transition-all ${
                    paymentMethod === "online" 
                      ? "border-brand-charcoal bg-brand-cream/20 font-bold" 
                      : "border-brand-taupe/40 bg-white"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="sr-only"
                    />
                    <span className="text-xs text-brand-charcoal font-sans">Online Payment</span>
                    <span className="text-[9px] text-neutral-500 font-sans mt-0.5">UPI, Cards, Netbanking</span>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                    !isCodAllowedForCart
                      ? "opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-50"
                      : paymentMethod === "cod"
                        ? "border-brand-charcoal bg-brand-cream/20 font-bold cursor-pointer"
                        : "border-brand-taupe/40 bg-white cursor-pointer hover:bg-brand-cream/10"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      disabled={!isCodAllowedForCart}
                      onChange={() => {
                        if (isCodAllowedForCart) {
                          setPaymentMethod("cod");
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-xs text-brand-charcoal font-sans">Cash on Delivery</span>
                    <span className={`text-[9px] font-sans mt-0.5 ${!isCodAllowedForCart ? "text-red-500 font-medium" : "text-neutral-500"}`}>
                      {isCodAllowedForCart ? "Pay on delivery" : "Unavailable (Prepaid Items)"}
                    </span>
                  </label>
                </div>
                
                {!isCodAllowedForCart && (
                  <p className="text-[10px] text-red-500 italic font-sans">
                    * COD is disabled because one or more items in your cart require online prepayment.
                  </p>
                )}
              </div>

            </div>

            {/* Footer for address confirmation */}
            <div className="p-6 border-t border-brand-taupe bg-brand-beige/30 space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full bg-brand-charcoal hover:bg-brand-espresso text-brand-cream py-3 text-xs uppercase tracking-[0.2em] font-sans font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-brand-cream border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order (${formatPrice(discountedSubtotal)})`
                )}
              </button>
              <button
                onClick={() => setCheckoutStep("cart")}
                className="w-full text-center py-2 text-xs uppercase tracking-[0.15em] font-sans text-neutral-500 hover:text-brand-charcoal transition-colors duration-300"
              >
                Back to Cart
              </button>
            </div>
          </>
        )}

        {/* Step 3: Success View */}
        {checkoutStep === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-brand-charcoal">Order Placed!</h3>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
              Thank you for your purchase. Your order <span className="font-semibold text-brand-charcoal">{placedOrderInfo?.orderNumber}</span> is being processed.
            </p>
            <div className="p-4 bg-brand-cream/30 border border-brand-taupe/30 rounded-lg text-left text-xs text-neutral-600 w-full space-y-1">
              <p><span className="font-semibold text-brand-charcoal">Deliver To:</span> {placedOrderInfo?.address}</p>
              <p><span className="font-semibold text-brand-charcoal">Phone:</span> +91 {placedOrderInfo?.phone}</p>
              <p>
                <span className="font-semibold text-brand-charcoal">
                  {placedOrderInfo?.paymentStatus === "Cash on Delivery" ? "To Pay on Delivery:" : "Total Paid:"}
                </span>{" "}
                {formatPrice(placedOrderInfo?.total || 0)}
              </p>
            </div>
            <div className="pt-4 w-full space-y-2">
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setCheckoutStep("cart");
                  router.push("/profile?tab=orders");
                }}
                className="w-full bg-brand-charcoal hover:bg-brand-espresso text-brand-cream py-3 text-xs uppercase tracking-[0.15em] font-sans font-medium transition-all duration-300 cursor-pointer"
              >
                View My Orders
              </button>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setCheckoutStep("cart");
                }}
                className="w-full text-center py-2 text-xs uppercase tracking-[0.15em] font-sans text-neutral-500 hover:text-brand-charcoal transition-colors duration-300"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
