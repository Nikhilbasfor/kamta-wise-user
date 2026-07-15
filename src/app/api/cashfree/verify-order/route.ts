import { NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/verifyToken";

export async function GET(request: Request) {
  const user = await verifyUserToken(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || "production";

    if (!appId || !secretKey) {
      return NextResponse.json({ error: "Cashfree credentials are not configured on the server." }, { status: 500 });
    }

    const baseUrl = env === "production" 
      ? `https://api.cashfree.com/pg/orders/${orderId}` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch order from Cashfree" }, { status: response.status });
    }

    return NextResponse.json({
      orderId: data.order_id,
      orderStatus: data.order_status, // e.g. "PAID", "ACTIVE", "FAILED"
      paymentStatus: data.order_status === "PAID" ? "SUCCESS" : "PENDING/FAILED",
    });
  } catch (error: any) {
    console.error("Cashfree order verification error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
