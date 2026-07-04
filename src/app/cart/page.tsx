import { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart — Kamta Wise",
};

export default function CartPage() {
  return <CartPageClient />;
}
