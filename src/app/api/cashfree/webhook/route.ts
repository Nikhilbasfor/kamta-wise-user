import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature or timestamp headers" }, { status: 400 });
  }

  const rawBody = await request.text();
  const secretKey = process.env.CASHFREE_WEBHOOK_SECRET;

  if (!secretKey) {
    console.error("CASHFREE_WEBHOOK_SECRET is not configured on the server.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Verify signature
  const signStr = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(signStr)
    .digest("base64");

  if (signature !== expectedSignature) {
    console.warn("Signature mismatch on Cashfree webhook request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paymentStatus = payload?.data?.payment?.payment_status;
  const orderId = payload?.data?.order?.order_id;

  if (paymentStatus === "SUCCESS" && orderId) {
    try {
      // Find order in top-level /orders collection (using orderId as the doc name)
      const orderRef = adminDb.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        // Update its status to "confirmed"
        await orderRef.update({ status: "confirmed" });

        // Also update the order status inside the user's subcollection
        const orderData = orderDoc.data();
        const userId = orderData?.userId;
        if (userId) {
          const userOrderRef = adminDb.collection("users").doc(userId).collection("orders").doc(orderId);
          await userOrderRef.update({ status: "confirmed" });

          // Also update the order inside the user profile orders array
          const userRef = adminDb.collection("users").doc(userId);
          const userDoc = await userRef.get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            const ordersList = userData?.orders || [];
            const updatedOrders = ordersList.map((ord: any) => {
              if (ord.orderNumber === `#${orderId}` || ord.cashfreeOrderId === orderId) {
                return { ...ord, status: "confirmed" };
              }
              return ord;
            });
            await userRef.update({ orders: updatedOrders });
          }
        }

        console.log(`Successfully updated order ${orderId} status to confirmed via webhook`);
        } else {
          console.log(`Order ${orderId} not found in top-level orders. Checking pendingOrders...`);
          const pendingSnap = await adminDb.collection("pendingOrders")
            .where("cashfreeOrderId", "==", orderId)
            .limit(1)
            .get();

          if (!pendingSnap.empty) {
            const pendingDoc = pendingSnap.docs[0];
            const userId = pendingDoc.id;
            const pendingOrder = pendingDoc.data();

            const orderWithCreatedAt = {
              ...pendingOrder,
              status: "confirmed",
              createdAt: pendingOrder.createdAt || new Date().toISOString(),
              userName: pendingOrder.userName || "Customer",
              userEmail: pendingOrder.userEmail || ""
            };

            // Save to top-level orders
            await adminDb.collection("orders").doc(orderId).set({ ...orderWithCreatedAt, userId });

            // Save to user's orders subcollection
            await adminDb.collection("users").doc(userId).collection("orders").doc(orderId).set(orderWithCreatedAt);

            // Update user's profile orders list
            const userRef = adminDb.collection("users").doc(userId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              const ordersList = userData?.orders || [];
              const exists = ordersList.some((o: any) => o.orderNumber === pendingOrder.orderNumber);
              if (!exists) {
                await userRef.update({
                  orders: [orderWithCreatedAt, ...ordersList]
                });
              }
            }

            // Delete from pendingOrders
            await pendingDoc.ref.delete();
            console.log(`Successfully recovered and placed order ${orderId} from pendingOrders via webhook`);
          } else {
            console.warn(`Order ${orderId} not found in pendingOrders either.`);
          }
        }
      } catch (dbErr: any) {
        console.error("Database update error during webhook processing:", dbErr.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
