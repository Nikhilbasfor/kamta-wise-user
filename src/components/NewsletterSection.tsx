"use client";

import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function NewsletterSection() {
  const { user, setIsAuthModalOpen } = useAuth();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [loadingCheck, setLoadingCheck] = useState(false);

  // Check localStorage first for instant initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kamta_wise_subscribed_email");
      if (stored) {
        setSubscribed(true);
        setSubscribedEmail(stored);
      }
    }
  }, []);

  // Check Firestore for user's email subscription state across devices
  useEffect(() => {
    if (!user?.email) return;

    const userEmailNormalized = user.email.trim().toLowerCase();
    
    // Auto-fill default input if not already subscribed
    if (!subscribed) {
      setEmail(user.email);
    }

    async function checkSubscription() {
      try {
        setLoadingCheck(true);
        const q = query(
          collection(db, "newsletter_subscribers"),
          where("email", "==", userEmailNormalized)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setSubscribed(true);
          setSubscribedEmail(userEmailNormalized);
          if (typeof window !== "undefined") {
            localStorage.setItem("kamta_wise_subscribed_email", userEmailNormalized);
          }
        }
      } catch (err) {
        console.error("Error checking newsletter subscription status:", err);
      } finally {
        setLoadingCheck(false);
      }
    }

    checkSubscription();
  }, [user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const targetEmail = email.trim().toLowerCase();
    if (targetEmail) {
      try {
        // Check if email already exists in Firestore to avoid duplicate records
        const q = query(
          collection(db, "newsletter_subscribers"),
          where("email", "==", targetEmail)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          await addDoc(collection(db, "newsletter_subscribers"), {
            email: targetEmail,
            subscribedAt: new Date()
          });
        }

        setSubscribed(true);
        setSubscribedEmail(targetEmail);
        if (typeof window !== "undefined") {
          localStorage.setItem("kamta_wise_subscribed_email", targetEmail);
        }
        setEmail("");
      } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        alert("Failed to subscribe. Please try again.");
      }
    }
  };

  return (
    <section className="bg-brand-beige border-y border-brand-taupe/40 py-16 px-4 md:py-20">
      <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-in">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-sans block">
          KAMTA JOURNAL
        </span>
        <h2 className="text-3xl md:text-4xl font-light text-brand-charcoal tracking-wide font-serif">
          Subscribe for Editorial Updates
        </h2>
        <p className="text-sm font-sans font-light text-neutral-500 max-w-md mx-auto leading-relaxed">
          Be the first to explore new arrivals, seasonal collections, lookbooks, and exclusive design stories.
        </p>

        {!user ? (
          <div className="pt-2 max-w-md mx-auto space-y-4">
            <p className="text-xs font-sans text-neutral-400">
              Please sign in or sign up to subscribe to our journal.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 bg-brand-charcoal hover:bg-brand-espresso text-brand-cream text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 mx-auto block cursor-pointer"
            >
              Sign In / Sign Up
            </button>
          </div>
        ) : subscribed ? (
          <div className="p-5 bg-brand-cream border border-brand-taupe/80 text-brand-espresso text-xs font-sans tracking-wide rounded-xl shadow-xs animate-fade-in space-y-1">
            <span className="font-semibold uppercase tracking-widest text-[10px] text-brand-charcoal block">You're Subscribed!</span>
            <p className="text-neutral-500 font-light">You will receive the latest drops on <strong className="font-mono text-brand-charcoal font-medium">{subscribedEmail || user.email}</strong>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border border-brand-taupe px-4 py-3 text-xs tracking-wider font-sans focus:outline-none focus:border-brand-espresso placeholder-neutral-400"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand-charcoal hover:bg-brand-espresso text-brand-cream text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 flex items-center justify-center gap-2 border border-brand-charcoal hover:border-brand-espresso cursor-pointer"
            >
              Subscribe
              <Send size={12} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
