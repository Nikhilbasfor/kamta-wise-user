"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Share2, Shield, Truck, RefreshCw, ChevronLeft, Play } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/data/products";
import QuantitySelector from "@/components/QuantitySelector";
import SizeSelector from "@/components/SizeSelector";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

// Seeded random generator for stable, distinct recommendations per product
const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWithSeed = (array: any[], seed: string) => {
  const rand = seededRandom(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart, isInWishlist, clearCart, triggerCheckout } = useStore();
  const { user, setIsAuthModalOpen } = useAuth();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openSection, setOpenSection] = useState<"details" | "shipping" | "sustainability">("details");
  const [copiedShare, setCopiedShare] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Swipe gesture state variables
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  // Set defaults
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0] || "");
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [product]);

  // Reset active image index to 0 when the selected color changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  // Resolve color specific images list
  const getColorSpecificImages = () => {
    if (!product.colorImages || !selectedColor) return product.images;
    const colorKey = Object.keys(product.colorImages).find(
      (key) => key.toLowerCase() === selectedColor.toLowerCase()
    );
    if (colorKey && product.colorImages[colorKey] && product.colorImages[colorKey].length > 0) {
      const colorSpecific = product.colorImages[colorKey];
      const remaining = product.images.filter(img => !colorSpecific.includes(img));
      return [...colorSpecific, ...remaining];
    }
    return product.images;
  };

  // Build unified list of images and videos
  const getMediaList = () => {
    const imgs = getColorSpecificImages();
    const list: { type: "image" | "video"; src: string }[] = imgs.map(src => ({ type: "image", src }));
    if (product.videoUrl) {
      list.push({ type: "video", src: product.videoUrl });
    }
    return list;
  };

  const mediaList = getMediaList();

  // Load category recommendations
  useEffect(() => {
    if (!product?.category) return;
    const fetchRecommendations = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", product.category),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const list: Product[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (docSnap.id !== product.id && data.isActive !== false) {
            list.push({ id: docSnap.id, ...data } as Product);
          }
        });
        
        // Stably shuffle recommendations using the current product ID as a seed
        const shuffled = shuffleWithSeed(list, product.id);
        setRecommendations(shuffled.slice(0, 4));
      } catch (err) {
        console.error("Error fetching recommended products:", err);
      }
    };
    fetchRecommendations();
  }, [product]);

  // Swipe gesture handers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only process horizontal swipes and ignore vertical scrolling gestures
    if (Math.abs(diffX) > Math.abs(diffY)) {
      const isLeftSwipe = diffX > minSwipeDistance;
      const isRightSwipe = diffX < -minSwipeDistance;

      if (isLeftSwipe) {
        setActiveImageIndex((prev) => (prev + 1) % mediaList.length);
      } else if (isRightSwipe) {
        setActiveImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
    }
  };

  const isWishlisted = isInWishlist(product.id);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }
    clearCart();
    addToCart(product, selectedSize, selectedColor, quantity);
    setTimeout(() => {
      triggerCheckout();
    }, 100);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 bg-brand-cream">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-sans">
        <Link href="/" className="hover:text-brand-charcoal transition-colors">
          Home
        </Link>
        <ChevronRight size={10} />
        <Link href="/shop" className="hover:text-brand-charcoal transition-colors">
          Shop
        </Link>
        <ChevronRight size={10} />
        <span className="text-neutral-500 font-medium truncate max-w-[150px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main product presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Image/Video Gallery (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Image/Video Box */}
          <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="relative aspect-[3/4] w-full bg-brand-beige overflow-hidden rounded-2xl border border-brand-taupe/20 shadow-xs group touch-pan-y"
          >
            {mediaList[activeImageIndex] && (
              mediaList[activeImageIndex].type === "video" ? (
                <div className="w-full h-full bg-black">
                  {mediaList[activeImageIndex].src.includes("youtube.com") || mediaList[activeImageIndex].src.includes("youtu.be") ? (
                    <iframe
                      src={mediaList[activeImageIndex].src.includes("watch?v=") 
                        ? `https://www.youtube.com/embed/${mediaList[activeImageIndex].src.split("watch?v=")[1]?.split("&")[0]}`
                        : mediaList[activeImageIndex].src.includes("youtu.be/")
                        ? `https://www.youtube.com/embed/${mediaList[activeImageIndex].src.split("youtu.be/")[1]?.split("?")[0]}`
                        : mediaList[activeImageIndex].src
                      }
                      title="Product Video"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={mediaList[activeImageIndex].src}
                      controls
                      className="w-full h-full object-contain"
                      playsInline
                      autoPlay
                      muted
                    />
                  )}
                </div>
              ) : (
                <Image
                  src={mediaList[activeImageIndex].src}
                  alt={`${product.name} preview`}
                  fill
                  className="object-cover transition-all duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              )
            )}
            
            {/* Slide Arrows Overlay */}
            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow-md hover:scale-105 transition-all z-20 cursor-pointer duration-300 flex items-center justify-center"
                  aria-label="Previous media"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % mediaList.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow-md hover:scale-105 transition-all z-20 cursor-pointer duration-300 flex items-center justify-center"
                  aria-label="Next media"
                >
                  <ChevronRight size={18} />
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {mediaList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        activeImageIndex === idx ? "bg-brand-charcoal w-3.5" : "bg-brand-charcoal/30"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Sale Tag */}
            {product.discountedPrice && (
              <span className="absolute top-4 left-4 bg-brand-espresso text-white text-[9px] uppercase tracking-widest px-3 py-1 font-sans font-medium rounded-full shadow-xs z-10">
                Sale
              </span>
            )}
          </div>

          {/* Thumbnail Gallery Row */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {mediaList.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 aspect-[3/4] rounded-lg overflow-hidden border flex-shrink-0 transition-all duration-300 ${
                  activeImageIndex === idx
                    ? "border-brand-charcoal ring-2 ring-brand-charcoal/20"
                    : "border-brand-taupe/30 hover:border-brand-charcoal/60"
                }`}
              >
                {item.type === "video" ? (
                  <div className="relative w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-white">
                    <span className="text-[8px] uppercase tracking-wider font-semibold z-10">Video</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.src}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Configuration (Span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            
            {/* Name, Category, Price */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-sans block">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-light text-brand-charcoal font-serif tracking-wide leading-tight">
                {product.name}
              </h1>

              {/* Price display with discount support */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {product.discountedPrice ? (
                  <>
                    <span className="text-xl font-serif text-brand-espresso font-medium">
                      {formatPrice(product.discountedPrice)}
                    </span>
                    <span className="text-sm font-sans line-through text-neutral-400">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-brand-espresso font-sans font-medium px-2 py-0.5 bg-brand-beige/50 border border-brand-taupe/20 rounded-md">
                      Save {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-serif text-brand-charcoal">
                    {formatPrice(product.price)}
                  </span>
                )}

                {/* Stock indicator badge */}
                {product.stock !== undefined && (
                  product.stock === 0 ? (
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Out of Stock
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Only {product.stock} Left in Stock
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md uppercase tracking-wider font-sans">
                      In Stock ({product.stock} Left)
                    </span>
                  )
                )}
              </div>

              {/* Product Promo Code Offer Banner */}
              {product.promoCode && (
                <div className="mt-3 p-3 bg-gradient-to-r from-amber-50/80 to-amber-100/50 border border-amber-200/80 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider block">Special Promo Offer</span>
                    <span className="text-xs text-amber-800 font-sans">
                      Use code <strong className="font-mono text-amber-950 font-bold bg-amber-200/60 px-1.5 py-0.5 rounded border border-amber-300">{product.promoCode}</strong> at checkout {product.promoDiscount ? `for ₹${product.promoDiscount} OFF!` : "for special savings!"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-brand-taupe/20" />

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-500 font-sans font-light leading-relaxed">
              {product.description}
            </p>

            {/* Color selection */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-sans block">
                Color: <span className="text-brand-charcoal font-medium">{selectedColor || "Select"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border text-[10px] uppercase tracking-wider font-sans transition-all duration-200 ${
                      selectedColor === color
                        ? "border-brand-charcoal bg-brand-charcoal text-brand-cream font-medium"
                        : "border-brand-taupe hover:border-brand-charcoal text-brand-charcoal bg-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection using component */}
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onChange={setSelectedSize}
            />

            {/* Quantity selector */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-sans block">
                Quantity
              </span>
              <QuantitySelector
                quantity={quantity}
                onChange={setQuantity}
                className="w-32"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="flex flex-1 gap-3">
                <AddToCartButton onClick={handleAddToCart} className="flex-1" />
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 bg-brand-espresso hover:bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest font-sans font-medium transition-all duration-300 rounded-lg flex items-center justify-center cursor-pointer border border-brand-espresso"
                >
                  Buy Now
                </button>
              </div>
              <WishlistButton product={product} className="aspect-square w-12 flex-shrink-0" iconSize={20} />
            </div>

            {/* Premium details trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center">
              <div className="p-3 border border-brand-taupe/20 bg-white/40 rounded-xl space-y-1">
                <Truck size={16} className="mx-auto text-neutral-500" />
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Free Delivery</span>
              </div>
              <div className="p-3 border border-brand-taupe/20 bg-white/40 rounded-xl space-y-1">
                <RefreshCw size={16} className={`mx-auto ${product.isReturnable === false ? "text-red-500" : "text-neutral-500"}`} />
                <span className={`text-[9px] uppercase tracking-wider font-sans block ${product.isReturnable === false ? "text-red-500 font-medium" : "text-neutral-400"}`}>
                  {product.isReturnable === false ? "Non-Returnable" : "10-Day Returns"}
                </span>
              </div>
              <div className="p-3 border border-brand-taupe/20 bg-white/40 rounded-xl space-y-1">
                <Shield size={16} className={`mx-auto ${product.isCodAllowed === false ? "text-amber-600" : "text-neutral-500"}`} />
                <span className={`text-[9px] uppercase tracking-wider font-sans block ${product.isCodAllowed === false ? "text-amber-700 font-medium" : "text-neutral-400"}`}>
                  {product.isCodAllowed === false ? "Prepaid Only" : "COD Available"}
                </span>
              </div>
            </div>

            {/* Share link and additional metadata options */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleShare}
                className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 hover:text-brand-charcoal transition-colors font-sans flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 size={12} />
                {copiedShare ? "Link Copied" : "Share Design"}
              </button>
            </div>

          </div>

          {/* Details Collapsible Accordions */}
          <div className="border-t border-brand-taupe/30 pt-6 mt-6 space-y-4">
            
            {/* Section triggers */}
            <div className="flex border-b border-brand-taupe/20 pb-2">
              <button
                onClick={() => setOpenSection("details")}
                className={`flex-1 pb-1.5 text-center text-xs uppercase tracking-widest font-sans transition-colors cursor-pointer ${
                  openSection === "details"
                    ? "border-b-2 border-brand-charcoal text-brand-charcoal font-medium"
                    : "text-neutral-400 hover:text-brand-charcoal"
                }`}
              >
                Specs & Care
              </button>
              <button
                onClick={() => setOpenSection("shipping")}
                className={`flex-1 pb-1.5 text-center text-xs uppercase tracking-widest font-sans transition-colors cursor-pointer ${
                  openSection === "shipping"
                    ? "border-b-2 border-brand-charcoal text-brand-charcoal font-medium"
                    : "text-neutral-400 hover:text-brand-charcoal"
                }`}
              >
                Shipping
              </button>
              <button
                onClick={() => setOpenSection("sustainability")}
                className={`flex-1 pb-1.5 text-center text-xs uppercase tracking-widest font-sans transition-colors cursor-pointer ${
                  openSection === "sustainability"
                    ? "border-b-2 border-brand-charcoal text-brand-charcoal font-medium"
                    : "text-neutral-400 hover:text-brand-charcoal"
                }`}
              >
                Ethics
              </button>
            </div>

            {/* Section contents */}
            <div className="py-2 text-xs text-neutral-500 font-sans font-light leading-relaxed min-h-[80px]">
              {openSection === "details" && (
                <div className="space-y-2">
                  <p>
                    <strong className="text-brand-charcoal font-medium">Fabrication:</strong> {product.fabric}
                  </p>
                  <p>
                    <strong className="text-brand-charcoal font-medium">Fit & Silhouette:</strong> {product.fit}
                  </p>
                  <p>
                    <strong className="text-brand-charcoal font-medium">Care Instructions:</strong> {product.care}
                  </p>
                </div>
              )}
              {openSection === "shipping" && (
                <p>
                  Complimentary standard shipping is applied automatically to all orders. Orders are processed within 24-48 business hours and shipped from our studio. Delivery takes 3-5 business days depending on location. Fast track shipping options are available during checkout.
                </p>
              )}
              {openSection === "sustainability" && (
                <p>
                  We are deeply committed to zero-waste production methods and small-batch sourcing. All fabrics are ethically handwoven and sourced from local artisans. Our packaging materials are 100% biodegradable and organic to preserve the environment.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Category Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t border-brand-taupe/20 pt-12 mt-12 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-sans block">
              More from this category
            </span>
            <h2 className="text-xl md:text-2xl font-light text-brand-charcoal font-serif tracking-wide">
              Recommended for You
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((recProduct) => (
              <Link 
                href={`/shop/${recProduct.slug}`} 
                key={recProduct.id} 
                className="group space-y-3 block cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full bg-brand-beige overflow-hidden rounded-xl border border-brand-taupe/10">
                  {recProduct.images && recProduct.images[0] && (
                    <Image
                      src={recProduct.images[0]}
                      alt={recProduct.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  {recProduct.discountedPrice && (
                    <span className="absolute top-2 left-2 bg-brand-espresso text-white text-[8px] uppercase tracking-widest px-2 py-0.5 font-sans font-medium rounded">
                      Sale
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xs font-serif text-brand-charcoal font-light group-hover:text-brand-espresso transition-colors truncate">
                    {recProduct.name}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {recProduct.discountedPrice ? (
                      <>
                        <span className="text-xs font-serif font-medium text-brand-espresso">
                          {formatPrice(recProduct.discountedPrice)}
                        </span>
                        <span className="text-[10px] font-sans line-through text-neutral-400">
                          {formatPrice(recProduct.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-serif text-brand-charcoal">
                        {formatPrice(recProduct.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
