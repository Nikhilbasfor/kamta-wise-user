import { NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/verifyToken";

export async function POST(request: Request) {
  const user = await verifyUserToken(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { orderId, orderAmount, customerDetails, returnUrl } = body;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || "production";

    if (!appId || !secretKey) {
      return NextResponse.json({ error: "Cashfree credentials are not configured on the server." }, { status: 500 });
    }

    const baseUrl = env === "production" 
      ? "https://api.cashfree.com/pg/orders" 
      : "https://sandbox.cashfree.com/pg/orders";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(orderAmount),
        order_currency: "INR",
        customer_details: {
          customer_id: customerDetails.customerId,
          customer_name: customerDetails.customerName || "Customer",
          customer_email: customerDetails.customerEmail,
          customer_phone: customerDetails.customerPhone,
        },
        order_meta: {
          return_url: returnUrl,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to create order with Cashfree" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Cashfree order creation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
