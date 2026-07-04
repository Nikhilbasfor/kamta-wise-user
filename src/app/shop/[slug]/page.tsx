import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProductBySlug(slug: string) {
  try {
    const q = query(
      collection(db, "products"),
      where("slug", "==", slug),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    // Check if product is active
    if (data.isActive === false) {
      return null;
    }
    return { id: docSnap.id, ...data } as any;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: "Product Not Found | Kamta Wise",
    };
  }
  return {
    title: `${product.name} | Kamta Wise`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Kamta Wise`,
      description: product.description,
      images: [{ url: product.images?.[0] || "" }],
      url: `https://www.kamtawise.in/shop/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Kamta Wise`,
      description: product.description,
    }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
