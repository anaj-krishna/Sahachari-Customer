# Payment Integration Documentation (Sahachari-Customer)

## 1. Purpose
This document defines how the Sahachari Customer mobile app should integrate payment during checkout.

It covers:
- The current app behavior.
- The target payment flow.
- Required API calls.
- Required updates in hooks/services/components.
- Error handling and testing.

---

## 2. Current App Behavior (As-Is)

Today, the checkout process places an order directly:

1. User opens checkout modal and enters address.
2. App calls `placeOrder(orderData)`.
3. API request goes to `POST /customer/orders`.
4. Backend creates order(s) and cart is cleared.

### Current Limitation
- No payment gateway step in app.
- No payment verification call before order placement.
- No payment state shown in UI.

---

## 3. Target App Flow (To-Be)

New payment flow should be:

1. User enters delivery details.
2. App requests payment session from backend.
3. App opens payment SDK checkout.
4. On success callback, app sends verification payload to backend.
5. Backend verifies signature and then places orders.
6. App shows success modal only after verification succeeds.

If payment fails/cancelled:
- Keep cart unchanged.
- Show clear error.
- Allow user to retry payment.

---

## 4. Backend API Contracts Used by App

## 4.1 Create Payment Session
**Endpoint:** `POST /customer/payments/create-session`

**Request body**
```json
{
  "street": "123 Main Street",
  "city": "Mumbai",
  "zipCode": "400001",
  "phone": "+919876543210",
  "notes": "Call before delivery"
}
```

**Response body**
```json
{
  "checkoutId": "CHECKOUT-1711455300000-ab12cd345",
  "gateway": "RAZORPAY",
  "amount": 154900,
  "currency": "INR",
  "gatewayOrderId": "order_MxABC123",
  "publicKey": "rzp_test_xxxxx",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

## 4.2 Verify Payment
**Endpoint:** `POST /customer/payments/verify`

**Request body**
```json
{
  "checkoutId": "CHECKOUT-1711455300000-ab12cd345",
  "gatewayOrderId": "order_MxABC123",
  "gatewayPaymentId": "pay_MxDEF456",
  "signature": "payment_signature"
}
```

**Success response**
```json
{
  "message": "Payment verified and order placed successfully",
  "checkoutId": "CHECKOUT-1711455300000-ab12cd345",
  "ordersCount": 2,
  "totalAmount": 1549,
  "orders": [
    { "_id": "...", "status": "PLACED" },
    { "_id": "...", "status": "PLACED" }
  ]
}
```

---

## 5. App Code Changes

## 5.1 Add Payment APIs
Create `src/services/payments.api.ts` with:
- `createPaymentSession(address)`
- `verifyPayment(payload)`

Example:
```ts
import { api } from "./api";

export const createPaymentSession = (address: {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  notes?: string;
}) => api.post("/customer/payments/create-session", address).then((r) => r.data);

export const verifyPayment = (payload: {
  checkoutId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}) => api.post("/customer/payments/verify", payload).then((r) => r.data);
```

## 5.2 Update Checkout Logic in Hook
In `src/hooks/useCart.tsx`, replace direct `placeOrder` flow with:
- Validate address.
- `createPaymentSession(address)`.
- Open gateway SDK.
- On success callback, call `verifyPayment(...)`.
- Invalidate `cart` and `orders` queries only after verify success.

## 5.3 Update Checkout Modal Behavior
In `src/components/cart/CheckoutModal.tsx`:
- Keep button label as `Pay & Place Order`.
- Show loading during both session creation and verification.
- Show specific error message for cancellation vs failure.

---

## 6. Payment State Handling

Track state locally for better UX:
- `idle`
- `creating_session`
- `awaiting_gateway`
- `verifying`
- `success`
- `failed`
- `cancelled`

Recommended behavior:
- Disable button in non-idle states.
- Prevent duplicate taps.
- Keep address data if payment does not succeed.

---

## 7. Error Handling

Map API/SDK errors to user-friendly messages:

- `400 Cart is empty` -> "Your cart is empty. Add items and try again."
- `400 Invalid signature` -> "Payment verification failed. Please contact support."
- `402 Payment failed` -> "Payment failed. Please try another method."
- `409 Duplicate verification` -> "Payment already processed. Refreshing your orders."
- `Network error` -> "Network issue. Please check your internet and retry."

---

## 8. Environment Variables (Client)

Add public payment key in `Sahachari-Customer` app env:
- `EXPO_PUBLIC_PAYMENT_KEY=...`

Notes:
- Only public key is allowed in mobile app.
- Secret/webhook keys must remain backend-only.

---

## 9. Suggested End-to-End Sequence

1. User taps checkout confirm.
2. App -> `POST /customer/payments/create-session`.
3. App opens gateway checkout using response payload.
4. Gateway returns success callback (`gatewayPaymentId`, `signature`, etc.).
5. App -> `POST /customer/payments/verify`.
6. Backend verifies and creates orders.
7. App refreshes `cart` and `orders`, shows success modal.

---

## 10. Testing Checklist (Customer App)

- Success payment path shows success modal and empties cart after refresh.
- Cancelled payment keeps cart intact.
- Failed verification does not show order success.
- Retry works after failure.
- Slow network keeps spinner and prevents duplicate submit.
- Multi-store cart still returns grouped order result with one `checkoutId`.

---

## 11. Migration Notes

If old flow (`POST /customer/orders`) is still active:
- Keep fallback only for Cash on Delivery (if needed), or
- Disable old flow once payment feature is released.

Keep app release synchronized with backend payment endpoints.

---

## 12. Summary

Sahachari-Customer should move from direct order placement to payment-first checkout:
- create session -> open gateway -> verify -> finalize order.

This ensures secure payment verification and reliable order creation behavior.
