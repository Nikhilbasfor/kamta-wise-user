"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Mail } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const InstagramIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface ContactInfo {
  whatsapp: string;
  email: string;
  instagram: string;
}

export default function Footer() {
  const [contacts, setContacts] = useState<ContactInfo>({
    whatsapp: "919864879505",
    email: "nikhilbasfor3@gmail.com",
    instagram: "@kamtawise",
  });

  useEffect(() => {
    const docRef = doc(db, "siteSettings", "main");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.contactInfo) {
          setContacts({
            whatsapp: data.contactInfo.whatsapp || "919864879505",
            email: data.contactInfo.email || "nikhilbasfor3@gmail.com",
            instagram: data.contactInfo.instagram || "@kamtawise",
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const cleanInstagramHandle = contacts.instagram.replace("@", "");
  const instagramUrl = cleanInstagramHandle.includes("kamtawise") || cleanInstagramHandle.includes("kamta.wise")
    ? "https://www.instagram.com/kamtawise?igsh=d2ozYjFmd2M3dzRu"
    : `https://instagram.com/${cleanInstagramHandle}`;

  return (
    <footer className="bg-brand-charcoal text-brand-beige pt-16 pb-24 md:pb-8 border-t border-brand-taupe/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link
              href="/"
              className="text-xl font-light tracking-[0.2em] font-serif text-white hover:opacity-85 transition-opacity"
            >
              KAMTA WISE
            </Link>
            <p className="text-xs text-neutral-400 font-sans font-light max-w-sm leading-relaxed">
              Designed for quiet confidence, crafted for everyday ease. We create clothing for people who value simplicity, elegance, and tactile comfort.
            </p>
          </div>

          {/* Column 2: Social & WhatsApp Connect */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-white font-sans font-semibold">
              Connect With Us
            </h4>
            <div className="space-y-3 text-xs text-neutral-400 font-sans font-light">
              <a
                href={`https://wa.me/${contacts.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageSquare size={14} />
                WhatsApp Support
              </a>
              <a
                href={`mailto:${contacts.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail size={14} />
                {contacts.email}
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <InstagramIcon size={14} />
                {contacts.instagram}
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-sans tracking-wide">
          <div>
            © {new Date().getFullYear()} KAMTA WISE. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span>Designed in India</span>
            <span>•</span>
            <span>Everyday Luxury</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
