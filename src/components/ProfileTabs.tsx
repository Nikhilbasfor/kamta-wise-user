"use client";

import React, { useState, useEffect } from "react";
import { User, ShoppingBag, MapPin, Info, MessageSquare, ShieldCheck, HelpCircle, ChevronRight, ChevronDown, Sparkles, Ruler, X } from "lucide-react";
import ContactForm from "./ContactForm";
import AuthScreen from "./AuthScreen";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface ProfileTabsProps {
  initialTab?: string;
}

export default function ProfileTabs({ initialTab = "account" }: ProfileTabsProps) {
  const { user, signOut, profile, updateProfileDetails, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const docRef = doc(db, "siteSettings", "main");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditPhone(profile.phone || "");
      setEditAddress(profile.address || "");
    } else if (user) {
      setEditName(user.displayName || "");
    }
  }, [profile, user, isEditing]);

  // Synchronize when the url query tab parameter changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      setExpandedMobileSection(initialTab);
      
      // Scroll to correct position
      setTimeout(() => {
        if (window.innerWidth < 768) {
          const element = document.getElementById(`mobile-tab-${initialTab}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [initialTab]);

  // Accordion sub-states
  const [shippingOpen, setShippingOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [damagedOpen, setDamagedOpen] = useState(false);
  const [customerCareOpen, setCustomerCareOpen] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [privacySupportOpen, setPrivacySupportOpen] = useState(false);

  // New FAQ States
  const [faq1Open, setFaq1Open] = useState(false);
  const [faq2Open, setFaq2Open] = useState(false);
  const [faq3Open, setFaq3Open] = useState(false);
  const [faq4Open, setFaq4Open] = useState(false);

  const tabs = [
    { id: "account", label: "My Account", icon: User },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "about", label: "About the Brand", icon: Info },
    { id: "contact", label: "Contact Us", icon: MessageSquare },
    { id: "shipping", label: "Shipping & Returns", icon: HelpCircle },
    { id: "privacy", label: "Privacy & Terms", icon: ShieldCheck },
    { id: "influencer", label: "Influencer Program", icon: Sparkles },
    { id: "sizeguide", label: "Size Guide", icon: Ruler },
    { id: "faq", label: "FAQs", icon: HelpCircle },
  ];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleMobileToggle = (tabId: string) => {
    if (expandedMobileSection === tabId) {
      setExpandedMobileSection(null);
    } else {
      setExpandedMobileSection(tabId);
      setTimeout(() => {
        const element = document.getElementById(`mobile-tab-${tabId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  };

  // Rendering Helper for Tab Content
  const renderTabContent = (tabId: string) => {
    if (!user) {
      if (tabId === "account") {
        return <AuthScreen isModal={true} />;
      }
      if (tabId === "orders") {
        return (
          <div className="text-center py-12 font-sans text-neutral-400 space-y-4">
            <ShoppingBag size={32} className="mx-auto text-neutral-300" />
            <p className="text-sm font-light">Please sign in to view your order history.</p>
            <button
              onClick={() => {
                setActiveTab("account");
                setExpandedMobileSection("account");
                setIsAuthModalOpen(true);
              }}
              className="px-6 py-2 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest hover:bg-brand-espresso transition-colors font-sans cursor-pointer"
            >
              Sign In
            </button>
          </div>
        );
      }
    }

    switch (tabId) {
      case "account":
        if (isEditing) {
          return (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updateProfileDetails(editName, editPhone, editAddress);
                  setIsEditing(false);
                  alert("Profile updated successfully!");
                } catch (err: any) {
                  alert(err.message || "Failed to update profile.");
                }
              }}
              className="space-y-6 animate-fade-in"
            >
              <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
                Edit Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-sans">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Email Address</span>
                  <p className="text-sm font-light text-neutral-500 py-2">{profile?.email || user?.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-sans">Phone Number (+91)</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans"
                    placeholder="9876543210"
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-sans">Shipping Address</label>
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm h-20 resize-none font-sans"
                    placeholder="Flat No, Building, Street, Area, City, Pincode"
                    required
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-charcoal hover:bg-brand-espresso text-xs uppercase tracking-widest text-brand-cream transition-colors duration-300 cursor-pointer font-sans"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 border border-brand-charcoal text-xs uppercase tracking-widest text-brand-charcoal hover:bg-neutral-100 transition-colors duration-300 cursor-pointer font-sans"
                >
                  Cancel
                </button>
              </div>
            </form>
          );
        }
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">Full Name</span>
                <p className="text-sm font-light text-brand-charcoal">{profile?.name || user?.displayName || "Member"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">Email Address</span>
                <p className="text-sm font-light text-brand-charcoal">{profile?.email || user?.email || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">Phone Number</span>
                <p className="text-sm font-light text-brand-charcoal">{profile?.phone ? `+91 ${profile.phone}` : "Not set"}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">Shipping Address</span>
                <p className="text-sm font-light text-brand-charcoal whitespace-pre-line">{profile?.address || "Not set"}</p>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 border border-brand-charcoal text-xs uppercase tracking-widest text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-cream transition-colors duration-300 cursor-pointer font-sans"
              >
                Edit Profile
              </button>
              <button
                onClick={signOut}
                className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-xs uppercase tracking-widest text-white transition-colors duration-300 cursor-pointer font-sans"
              >
                Sign Out
              </button>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
              Order History
            </h3>
            {profile?.orders && profile.orders.length > 0 ? (
              <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-brand-taupe">
                {profile.orders.map((order: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedOrder(order)}
                    className="border border-brand-taupe/50 p-4 bg-white hover:bg-brand-cream/20 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400">Order Number</span>
                        <span className="text-xs font-semibold text-brand-charcoal">{order.orderNumber || `#MA-2026-${1000 + idx}`}</span>
                      </div>
                      <div className="text-xs text-neutral-500 font-light">
                        Placed on {order.date || new Date().toLocaleDateString("en-US")}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 block sm:text-right">Status</span>
                        <span className="inline-block px-2 py-0.5 bg-neutral-100 text-brand-espresso text-[9px] uppercase tracking-wider font-medium">
                          {order.status || "Processing"}
                        </span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Total</span>
                        <span className="text-xs font-semibold text-brand-charcoal">{formatPrice(order.total)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="text-[10px] uppercase tracking-widest bg-brand-charcoal text-brand-cream px-3 py-1.5 hover:bg-brand-espresso transition-colors font-sans font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 font-sans text-neutral-400 space-y-3">
                <ShoppingBag size={32} className="mx-auto text-neutral-300" />
                <p className="text-sm font-light">You have not placed any orders yet.</p>
              </div>
            )}
          </div>
        );

      case "about":
        {
          const storyHeadline = siteSettings?.brandStory?.headline || "Our Story";
          const storyBody = siteSettings?.brandStory?.body || "Born out of a desire for quiet elegance and daily comfort, Kamta Wise redefines luxury through premium natural textiles, relaxed silhouettes, and sustainable local sourcing.";
          return (
            <div className="space-y-8 animate-fade-in text-brand-charcoal font-sans">
              <div className="border-b border-brand-taupe/40 pb-3">
                <h3 className="text-xl font-serif font-light">
                  {storyHeadline}
                </h3>
              </div>
              
              <p className="text-base font-serif font-light leading-relaxed italic text-brand-espresso pl-4 border-l border-brand-espresso/40 whitespace-pre-line">
                {storyBody}
              </p>
            </div>
          );
        }

      case "contact":
        {
          const whatsappNum = siteSettings?.contactInfo?.whatsapp || "919864879505";
          const supportEmail = siteSettings?.contactInfo?.email || "nikhilbasfor3@gmail.com";
          const instagramHandle = siteSettings?.contactInfo?.instagram || "@kamtawise";
          const cleanInsta = instagramHandle.replace("@", "");
          return (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
                Client Services
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Direct Info */}
                <div className="space-y-6 font-sans">
                  <p className="text-sm font-light text-neutral-500 leading-relaxed">
                    Have a question about sizing, styling, or shipping details? Our dedicated customer care advisors are here to assist you.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400">WhatsApp Support</span>
                      <a
                        href={`https://wa.me/${whatsappNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm font-medium text-brand-charcoal hover:text-brand-espresso underline decoration-brand-espresso/30"
                      >
                        +{whatsappNum} (Recommended)
                      </a>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400">Email Address</span>
                      <a
                        href={`mailto:${supportEmail}`}
                        className="block text-sm font-medium text-brand-charcoal hover:text-brand-espresso underline decoration-brand-espresso/30"
                      >
                        {supportEmail}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400">Instagram DM</span>
                      <a
                        href={instagramHandle.includes("kamtawise") || instagramHandle.includes("kamta.wise") ? "https://www.instagram.com/kamtawise?igsh=d2ozYjFmd2M3dzRu" : `https://instagram.com/${cleanInsta}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm font-medium text-brand-charcoal hover:text-brand-espresso underline decoration-brand-espresso/30"
                      >
                        {instagramHandle}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Form Component */}
                <div>
                  <ContactForm />
                </div>
              </div>
            </div>
          );
        }

      case "shipping":
        {
          const freeShipThreshold = siteSettings?.shippingPolicy?.freeShippingThreshold ?? 2999;
          const stdDays = siteSettings?.shippingPolicy?.standardDeliveryDays || "5-7";
          const expDays = siteSettings?.shippingPolicy?.expressDeliveryDays || "2-3";
          const shippingTimeline = siteSettings?.shippingPolicy?.shippingTimelineText || `Orders are processed within 1-2 business days. Domestic standard orders generally deliver in ${stdDays} business days. Express shipping (${expDays} business days) options are available. Free standard shipping applies to all orders above ${formatPrice(freeShipThreshold)}.`;
          const returnText = siteSettings?.shippingPolicy?.returnPolicyText || siteSettings?.returnPolicy?.body || "We support a hassle-free 10-day return policy. Garments must be unworn, undamaged, with original tags intact. Sizing adjustments can also be requested via WhatsApp.";
          const customerCare = siteSettings?.shippingPolicy?.customerCareText || `Our care channel is reachable at ${siteSettings?.contactInfo?.email || "care@kamtawise.com"} or by WhatsApp at +${siteSettings?.contactInfo?.whatsapp || "919864879505"} from Monday through Saturday, between 10:00 AM and 7:00 PM IST.`;

          return (
            <div className="space-y-6 animate-fade-in font-sans">
              <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
                Shipping & Returns Policy
              </h3>
              
              <div className="space-y-3">
                {/* Accordion 1 */}
                <div className="border border-brand-taupe/50 bg-white">
                  <button
                    onClick={() => setShippingOpen(!shippingOpen)}
                    className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                  >
                    Shipping Timeline
                    <ChevronRight size={14} className={`transform transition-transform ${shippingOpen ? "rotate-90" : ""}`} />
                  </button>
                  {shippingOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                      {shippingTimeline}
                    </div>
                  )}
                </div>

                {/* Accordion 2 */}
                <div className="border border-brand-taupe/50 bg-white">
                  <button
                    onClick={() => setReturnOpen(!returnOpen)}
                    className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                  >
                    Return & Exchange Policy
                    <ChevronRight size={14} className={`transform transition-transform ${returnOpen ? "rotate-90" : ""}`} />
                  </button>
                  {returnOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                      {returnText}
                    </div>
                  )}
                </div>

                {/* Accordion 3 */}
                <div className="border border-brand-taupe/50 bg-white">
                  <button
                    onClick={() => setCustomerCareOpen(!customerCareOpen)}
                    className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                  >
                    Customer Care Contact
                    <ChevronRight size={14} className={`transform transition-transform ${customerCareOpen ? "rotate-90" : ""}`} />
                  </button>
                  {customerCareOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                      {customerCare}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

      case "privacy":
        {
          const privacyText = siteSettings?.privacyTerms?.privacyPolicyText || "Kamta Wise respects your personal data. We will never sell or disclose your information to third-party brokers. Data collected is solely used to process shipments and personalize your wardrobe recommendations.";
          const termsText = siteSettings?.privacyTerms?.termsOfUseText || "By navigating this site, you agree to respect design copywrites and trade marks. Kamta Wise reserves the right to cancel transactions that violate fair retail policies or show signs of commercial resale fraud.";
          const dataCollection = siteSettings?.privacyTerms?.dataCollectionText || "We collect browser cookie tokens to remember your shopping cart items, wishlist saves, and active profile sessions. These are securely cleared when you log out or delete local browser history.";
          const supportText = siteSettings?.privacyTerms?.customerSupportText || "If you have questions regarding legal compliance or wish to request complete erasure of your guest history, please reach out to privacy@kamtawise.com.";

          return (
            <div className="space-y-6 animate-fade-in font-sans">
              <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
                Privacy & Legal Terms
              </h3>
              
              <div className="space-y-3">
                {/* Accordion 1 */}
                <div className="border border-brand-taupe/50 bg-white">
                  <button
                    onClick={() => setPrivacyOpen(!privacyOpen)}
                    className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                  >
                    Privacy Policy
                    <ChevronRight size={14} className={`transform transition-transform ${privacyOpen ? "rotate-90" : ""}`} />
                  </button>
                  {privacyOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                      {privacyText}
                    </div>
                  )}
                </div>

                {/* Accordion 2 */}
                <div className="border border-brand-taupe/50 bg-white">
                  <button
                    onClick={() => setTermsOpen(!termsOpen)}
                    className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                  >
                    Terms of Use
                    <ChevronRight size={14} className={`transform transition-transform ${termsOpen ? "rotate-90" : ""}`} />
                  </button>
                  {termsOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                      {termsText}
                    </div>
                  )}
                </div>

                {/* Accordion 3 */}
                <div className="border border-brand-taupe/50 bg-white">
                  <button
                    onClick={() => setDataOpen(!dataOpen)}
                    className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                  >
                    Data Collection
                    <ChevronRight size={14} className={`transform transition-transform ${dataOpen ? "rotate-90" : ""}`} />
                  </button>
                  {dataOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                      {dataCollection}
                    </div>
                  )}
                </div>

                {/* Accordion 4 */}
                <div className="border border-brand-taupe/50 bg-white">
                  <button
                    onClick={() => setPrivacySupportOpen(!privacySupportOpen)}
                    className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                  >
                    Customer Support & Data Erasure
                    <ChevronRight size={14} className={`transform transition-transform ${privacySupportOpen ? "rotate-90" : ""}`} />
                  </button>
                  {privacySupportOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                      {supportText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

      case "influencer":
        {
          const infHeadline = siteSettings?.influencerProgram?.headline || "Influencer Partnership Program";
          const infBody = siteSettings?.influencerProgram?.body || "We appreciate and collaborate with content creators who resonate with our minimal, quiet-luxury philosophy. Join the Kamta Wise Circle to co-create beautiful visual stories.";
          const benefitsRaw = siteSettings?.influencerProgram?.benefitsText;
          const eligibilityRaw = siteSettings?.influencerProgram?.eligibilityText || "We welcome creators with 5k+ followers on Instagram, Pinterest, or YouTube who focus on high-quality, raw aesthetic, minimal lifestyle, or sustainable fashion content.";

          return (
            <div className="space-y-6 animate-fade-in font-sans">
              <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
                {infHeadline}
              </h3>
              <p className="text-sm font-light text-neutral-500 leading-relaxed whitespace-pre-line">
                {infBody}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-sans font-bold">Partnership Benefits</span>
                    {benefitsRaw ? (
                      <p className="text-xs text-neutral-600 font-light leading-relaxed whitespace-pre-line">
                        {benefitsRaw}
                      </p>
                    ) : (
                      <ul className="text-xs text-neutral-600 font-light space-y-2 list-disc pl-4 leading-relaxed">
                        <li>Complimentary seasonal drops and curated collections.</li>
                        <li>10% affiliate commission for your audience referral sales.</li>
                        <li>First-look access to limited edition product launches.</li>
                        <li>Opportunities for official website and brand social media features.</li>
                      </ul>
                    )}
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-sans font-bold">Eligibility Guidelines</span>
                    <p className="text-xs text-neutral-600 font-light leading-relaxed whitespace-pre-line">
                      {eligibilityRaw}
                    </p>
                  </div>
                </div>
                <div className="border border-brand-taupe/50 p-5 bg-white space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-charcoal">Apply for Collaboration</h4>
                  <div className="space-y-3 font-sans">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Social Media Handle (e.g. @name)</label>
                      <input type="text" placeholder="@instagram_handle" className="w-full px-3 py-1.5 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Follower Count</label>
                      <input type="text" placeholder="e.g. 15k" className="w-full px-3 py-1.5 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Primary Audience Location</label>
                      <input type="text" placeholder="e.g. India, Europe" className="w-full px-3 py-1.5 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-xs font-sans" />
                    </div>
                    <button type="button" onClick={() => alert("Thank you for applying! Our collaborations team will review your profile and reach out within 3 business days.")} className="w-full py-2 bg-brand-charcoal hover:bg-brand-espresso text-[10px] uppercase tracking-widest text-brand-cream transition-colors font-medium cursor-pointer">
                      Submit Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

      case "sizeguide":
        {
          const sizeText = siteSettings?.sizeGuide?.body || "Most of our pieces are designed in relaxed, contemporary fits. Please use this guide to choose your perfect fit. All measurements are in inches.";
          const apparelNotes = siteSettings?.sizeGuide?.apparelNotes || "T-Shirts & Shirts: Designed with an intentional relaxed shoulder drop. Order your standard size for a modern silhouette or one size down for a classic tailored fit.";
          const shoeNotes = siteSettings?.sizeGuide?.shoeNotes || "Shoes Size Guide (UK Standard Fits):\nUK 6 = 25.0 cm | UK 7 = 25.8 cm | UK 8 = 26.7 cm | UK 9 = 27.5 cm | UK 10 = 28.3 cm | UK 11 = 29.2 cm.\nNote: For half sizes, we recommend sizing up to the nearest full size.";

          return (
            <div className="space-y-6 animate-fade-in font-sans">
              <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
                Size & Fit Guide
              </h3>
              <p className="text-sm font-light text-neutral-500 leading-relaxed whitespace-pre-line">
                {sizeText}
              </p>
              
              <div className="space-y-8 pt-2">
                {/* Apparel Size Guide */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">T-Shirts & Shirts (Apparel Size Chart)</h4>
                  <p className="text-xs text-neutral-500 font-light italic whitespace-pre-line bg-brand-cream/35 p-3 border-l-2 border-brand-espresso">
                    {apparelNotes}
                  </p>
                  <div className="overflow-x-auto border border-brand-taupe/40">
                    <table className="w-full text-xs text-left text-neutral-600 font-light font-sans">
                      <thead className="bg-brand-beige/50 text-[10px] uppercase text-brand-charcoal">
                        <tr>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Size Label</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Recommended Chest</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Garment Width (Flat)</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-100">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">S</td>
                          <td className="px-4 py-2.5">36" - 38"</td>
                          <td className="px-4 py-2.5">20.5"</td>
                          <td className="px-4 py-2.5">27.5"</td>
                        </tr>
                        <tr className="border-b border-neutral-100 bg-neutral-50/30">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">M</td>
                          <td className="px-4 py-2.5">38" - 40"</td>
                          <td className="px-4 py-2.5">21.5"</td>
                          <td className="px-4 py-2.5">28.5"</td>
                        </tr>
                        <tr className="border-b border-neutral-100">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">L</td>
                          <td className="px-4 py-2.5">40" - 42"</td>
                          <td className="px-4 py-2.5">22.5"</td>
                          <td className="px-4 py-2.5">29.5"</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">XL</td>
                          <td className="px-4 py-2.5">42" - 44"</td>
                          <td className="px-4 py-2.5">23.5"</td>
                          <td className="px-4 py-2.5">30.5"</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Trousers & Shorts Size Guide */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Trousers & Shorts (Waist Size Chart)</h4>
                  <div className="overflow-x-auto border border-brand-taupe/40">
                    <table className="w-full text-xs text-left text-neutral-600 font-light font-sans">
                      <thead className="bg-brand-beige/50 text-[10px] uppercase text-brand-charcoal">
                        <tr>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Size Label</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Waist Range (Inches)</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Inseam (Trousers)</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Inseam (Shorts)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-100">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">XS</td>
                          <td className="px-4 py-2.5">28" - 30"</td>
                          <td className="px-4 py-2.5">29.5"</td>
                          <td className="px-4 py-2.5">5.5"</td>
                        </tr>
                        <tr className="border-b border-neutral-100 bg-neutral-50/30">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">S</td>
                          <td className="px-4 py-2.5">30" - 32"</td>
                          <td className="px-4 py-2.5">30"</td>
                          <td className="px-4 py-2.5">6.5"</td>
                        </tr>
                        <tr className="border-b border-neutral-100">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">M</td>
                          <td className="px-4 py-2.5">32" - 34"</td>
                          <td className="px-4 py-2.5">30"</td>
                          <td className="px-4 py-2.5">7"</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">L</td>
                          <td className="px-4 py-2.5">34" - 36"</td>
                          <td className="px-4 py-2.5">30.5"</td>
                          <td className="px-4 py-2.5">7"</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footwear / Shoe Size Guide */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Footwear & Shoe Size Guide</h4>
                  <p className="text-xs text-neutral-500 font-light italic whitespace-pre-line bg-brand-cream/35 p-3 border-l-2 border-brand-espresso">
                    {shoeNotes}
                  </p>
                  <div className="overflow-x-auto border border-brand-taupe/40">
                    <table className="w-full text-xs text-left text-neutral-600 font-light font-sans">
                      <thead className="bg-brand-beige/50 text-[10px] uppercase text-brand-charcoal">
                        <tr>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">UK / India Size</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">US Size</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">EU Size</th>
                          <th className="px-4 py-2 border-b border-brand-taupe/40">Foot Length (CM)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-100">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">UK 6</td>
                          <td className="px-4 py-2.5">US 7</td>
                          <td className="px-4 py-2.5">EU 40</td>
                          <td className="px-4 py-2.5">25.0 cm</td>
                        </tr>
                        <tr className="border-b border-neutral-100 bg-neutral-50/30">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">UK 7</td>
                          <td className="px-4 py-2.5">US 8</td>
                          <td className="px-4 py-2.5">EU 41</td>
                          <td className="px-4 py-2.5">25.8 cm</td>
                        </tr>
                        <tr className="border-b border-neutral-100">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">UK 8</td>
                          <td className="px-4 py-2.5">US 9</td>
                          <td className="px-4 py-2.5">EU 42</td>
                          <td className="px-4 py-2.5">26.7 cm</td>
                        </tr>
                        <tr className="border-b border-neutral-100 bg-neutral-50/30">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">UK 9</td>
                          <td className="px-4 py-2.5">US 10</td>
                          <td className="px-4 py-2.5">EU 43</td>
                          <td className="px-4 py-2.5">27.5 cm</td>
                        </tr>
                        <tr className="border-b border-neutral-100">
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">UK 10</td>
                          <td className="px-4 py-2.5">US 11</td>
                          <td className="px-4 py-2.5">EU 44</td>
                          <td className="px-4 py-2.5">28.3 cm</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-brand-charcoal">UK 11</td>
                          <td className="px-4 py-2.5">US 12</td>
                          <td className="px-4 py-2.5">EU 45</td>
                          <td className="px-4 py-2.5">29.2 cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        }

      case "faq":
        {
          const faqItems = siteSettings?.faq?.items || [
            {
              question: "What is your fabric sourcing policy?",
              answer: "We strictly use GOTS-certified organic cotton, sustainably grown Belgian flax linen, biological mulberry silk, and biodegradable fibers. We dye our fabrics with eco-friendly chemical-free dyes that prevent runoff pollution."
            },
            {
              question: "Do you ship internationally?",
              answer: "Yes, we ship globally. Shipping times vary from 7-14 business days depending on location. International shipping rates are calculated dynamically at checkout, and customs duties are borne by the purchaser."
            },
            {
              question: "Can I modify my order after placing it?",
              answer: "To maintain rapid packaging speeds, order modifications (address update, size adjustment) are only supported within 2 hours of payment. Please contact our WhatsApp customer care or email care@kamtawise.com immediately."
            },
            {
              question: "How do I track my delivery?",
              answer: "Once your order is handed over to our shipping carriers (BlueDart / Delhivery), we will email you a tracking link along with an AWB tracking number. You can also view your active order tracking directly in your client dashboard."
            }
          ];
          return (
            <div className="space-y-6 animate-fade-in font-sans">
              <h3 className="text-xl font-serif font-light text-brand-charcoal border-b border-brand-taupe/40 pb-3">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-3 pt-2">
                {faqItems.map((item: any, idx: number) => {
                  const isOpen = !!openFaqs[idx];
                  return (
                    <div key={idx} className="border border-brand-taupe/50 bg-white">
                      <button
                        onClick={() => setOpenFaqs({ ...openFaqs, [idx]: !isOpen })}
                        className="w-full flex justify-between items-center p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                      >
                        {item.question}
                        <ChevronRight size={14} className={`transform transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-neutral-500 font-light leading-relaxed border-t border-neutral-100 animate-fade-in whitespace-pre-line">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-12">
      
      {/* Profile Overview Card */}
      {user ? (
        <div className="bg-brand-beige border border-brand-taupe/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-taupe flex items-center justify-center text-brand-charcoal rounded-full border border-brand-charcoal/10">
              <User size={26} strokeWidth={1.2} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-light text-brand-charcoal">{user.displayName || "Member"}</h2>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                {user.email || "Logged in with Firebase"}
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={signOut}
              className="w-full md:w-auto px-6 py-3 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest hover:bg-brand-espresso transition-colors duration-300 font-sans font-medium cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-brand-beige border border-brand-taupe/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-taupe flex items-center justify-center text-brand-charcoal rounded-full border border-brand-charcoal/10">
              <User size={26} strokeWidth={1.2} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-light text-brand-charcoal">Welcome, Guest</h2>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                Sign in to track orders, manage addresses and your profile.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={() => {
                setActiveTab("account");
                setExpandedMobileSection("account");
                setIsAuthModalOpen(true);
              }}
              className="w-full md:w-auto px-6 py-3 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest hover:bg-brand-espresso transition-colors duration-300 font-sans font-medium cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Main Tabs Layout */}
      <div>
        {/* Desktop Layout: Sidebar list + content block */}
        <div className="hidden md:flex gap-10 items-start">
          <div className="w-1/4 flex flex-col border border-brand-taupe/40 bg-white">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex items-center gap-3 px-5 py-4 text-left text-xs uppercase tracking-wider font-sans border-b border-neutral-100 last:border-0 transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-beige/30 text-brand-charcoal font-medium border-l-2 border-l-brand-espresso"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-brand-charcoal"
                  }`}
                >
                  <IconComp size={15} strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 bg-white border border-brand-taupe/40 p-8 min-h-[400px]">
            {renderTabContent(activeTab)}
          </div>
        </div>

        {/* Mobile Layout: Stacked Accordions */}
        <div className="block md:hidden space-y-4">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isExpanded = expandedMobileSection === tab.id;
            return (
              <div key={tab.id} id={`mobile-tab-${tab.id}`} className="border border-brand-taupe/50 bg-white scroll-mt-20">
                <button
                  onClick={() => handleMobileToggle(tab.id)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs uppercase tracking-wider font-sans font-medium text-brand-charcoal"
                >
                  <div className="flex items-center gap-3">
                    <IconComp size={15} strokeWidth={1.5} className="text-neutral-500" />
                    {tab.label}
                  </div>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isExpanded && (
                  <div className="p-4 border-t border-neutral-100 bg-brand-cream/10">
                    {renderTabContent(tab.id)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl z-10 border border-brand-taupe p-6 sm:p-8 animate-fade-in font-sans rounded-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-brand-charcoal transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            {/* Title */}
            <div className="border-b border-brand-taupe/40 pb-4 mb-6">
              <h3 className="text-lg font-serif font-light text-brand-charcoal uppercase tracking-wider">
                Order details
              </h3>
              <p className="text-xs text-neutral-500 font-sans mt-1">
                {selectedOrder.orderNumber}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6 pb-6 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Date Placed</span>
                <span className="font-medium text-brand-charcoal">{selectedOrder.date}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Order Status</span>
                <span className="inline-block px-2.5 py-0.5 bg-neutral-100 text-brand-espresso text-[10px] uppercase tracking-wider font-semibold">
                  {selectedOrder.status || "Processing"}
                </span>
              </div>
              {selectedOrder.trackingNumber && (
                <div className="sm:col-span-2 bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-blue-600 block font-semibold">Live Shipment Tracking</span>
                    <span className="text-xs font-mono font-bold text-brand-charcoal">
                      {selectedOrder.courierPartner || "Carrier"}: {selectedOrder.trackingNumber}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-medium uppercase tracking-wider">In Transit</span>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Shipping Address</span>
                <span className="text-neutral-600 font-light leading-relaxed whitespace-pre-line block bg-brand-cream/35 p-3 rounded-lg border border-brand-taupe/20">
                  {selectedOrder.address}
                </span>
              </div>
              {selectedOrder.phone && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Contact Phone</span>
                  <span className="font-medium text-brand-charcoal">+91 {selectedOrder.phone}</span>
                </div>
              )}
            </div>

            {/* Items Purchased */}
            <div className="space-y-4 mb-6">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Items Purchased</span>
              <div className="space-y-3">
                {selectedOrder.items && selectedOrder.items.map((item: any, itemIdx: number) => (
                  <div key={itemIdx} className="flex gap-4 items-start pb-3 border-b border-neutral-100 last:border-0 last:pb-0">
                    {item.product.images && item.product.images[0] && (
                      <div className="relative w-12 h-16 bg-brand-beige overflow-hidden flex-shrink-0 border border-brand-taupe/20 rounded-md">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-brand-charcoal truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5">
                        Color: {item.selectedColor} | Size: {item.selectedSize} | Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-semibold text-brand-charcoal">
                        {formatPrice((item.product.discountedPrice ?? item.product.price) * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[9px] text-neutral-400 font-light">
                          ({formatPrice(item.product.discountedPrice ?? item.product.price)} each)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Paid Summary */}
            <div className="bg-brand-beige/30 p-4 rounded-lg border border-brand-taupe/30 space-y-2 text-xs">
              <div className="flex justify-between font-light text-neutral-600">
                <span>Items Subtotal</span>
                <span>
                  {formatPrice(
                    selectedOrder.items
                      ? selectedOrder.items.reduce(
                          (acc: number, item: any) =>
                            acc + (item.product.discountedPrice ?? item.product.price) * item.quantity,
                          0
                        )
                      : selectedOrder.total
                  )}
                </span>
              </div>
              {selectedOrder.items &&
                selectedOrder.items.reduce(
                  (acc: number, item: any) =>
                    acc + (item.product.discountedPrice ?? item.product.price) * item.quantity,
                  0
                ) !== selectedOrder.total && (
                  <div className="flex justify-between font-light text-emerald-700">
                    <span>Discount Applied</span>
                    <span>
                      -{formatPrice(
                        selectedOrder.items.reduce(
                          (acc: number, item: any) =>
                            acc + (item.product.discountedPrice ?? item.product.price) * item.quantity,
                          0
                        ) - selectedOrder.total
                      )}
                    </span>
                  </div>
                )}
              <div className="flex justify-between font-medium text-brand-charcoal pt-2 border-t border-brand-taupe/40 text-sm">
                <span>Total Amount Paid</span>
                <span className="font-bold">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest hover:bg-brand-espresso transition-colors font-sans font-medium cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
