"use client";

import React, { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.contact && formData.message) {
      try {
        await addDoc(collection(db, "contact_messages"), {
          name: formData.name.trim(),
          email: formData.contact.trim(),
          message: formData.message.trim(),
          submittedAt: new Date(),
          status: "unread"
        });
        setSubmitted(true);
        setFormData({ name: "", contact: "", message: "" });
      } catch (error) {
        console.error("Error sending contact message:", error);
        alert("Failed to send message. Please try again.");
      }
    }
  };

  return (
    <div className="bg-white border border-brand-taupe/40 p-6 md:p-8">
      {submitted ? (
        <div className="text-center py-8 space-y-3 animate-fade-in">
          <CheckCircle className="mx-auto text-brand-espresso" size={36} strokeWidth={1.5} />
          <h4 className="text-lg font-serif font-light text-brand-charcoal">Message Sent Successfully</h4>
          <p className="text-xs text-neutral-500 font-sans max-w-sm mx-auto leading-relaxed">
            Thank you for reaching out to Kamta Wise. A client advisor will respond to your inquiry within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-xs uppercase tracking-widest text-brand-charcoal underline hover:text-brand-espresso"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h3 className="text-lg font-serif font-light text-brand-charcoal mb-4">Send a Message</h3>
          
          <div className="space-y-1">
            <label htmlFor="name" className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-brand-cream/20 border border-brand-taupe px-3 py-2.5 text-xs font-sans focus:outline-none focus:border-brand-charcoal placeholder-neutral-400"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="contact" className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block">
              Email Address or Phone Number
            </label>
            <input
              type="text"
              id="contact"
              required
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full bg-brand-cream/20 border border-brand-taupe px-3 py-2.5 text-xs font-sans focus:outline-none focus:border-brand-charcoal placeholder-neutral-400"
              placeholder="e.g. client@example.com or +91 99999 99999"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-brand-cream/20 border border-brand-taupe px-3 py-2.5 text-xs font-sans focus:outline-none focus:border-brand-charcoal placeholder-neutral-400 resize-none"
              placeholder="Tell us how we can assist you..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-charcoal hover:bg-brand-espresso text-brand-cream text-xs uppercase tracking-[0.15em] font-sans py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 border border-brand-charcoal hover:border-brand-espresso shadow-xs"
          >
            Submit Message
            <Send size={12} />
          </button>
        </form>
      )}
    </div>
  );
}
