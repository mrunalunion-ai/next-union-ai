# Stripe Payment Integration

## Overview
This document describes the Stripe payment integration in the UnionAI-Web frontend.

## Architecture

### Backend APIs (UnionAI Backend)
- `POST /api/stripe/checkout` - Create checkout session
- `GET /api/stripe/subscription` - Get subscription details
- `POST /api/stripe/subscription/upgrade` - Upgrade subscription
- `POST /api/stripe/subscription/cancel` - Cancel subscription
- `POST /api/stripe/subscription/resume` - Resume subscription
- `POST /api/stripe/portal` - Create customer portal session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Frontend Structure

```
frontend/
├── redux/modules/payment/      # Redux payment slice
│   ├── action.ts
│   ├── reducer.ts
│   ├── types.ts
│   └── index.ts
├── services/stripe/            # Stripe service layer
│   ├── paymentService.ts
│   └── index.ts
├── hooks/
│   └── use-stripe-checkout.ts  # Custom Stripe hook
├── components/payment/         # Payment UI components
│   ├── stripe-checkout-modal.tsx
│   └── index.ts
└── app/account/explore-plans/page.tsx  # Updated plan selection page
```

## Setup

### Environment Variables
Add to `.env`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Dependencies
```bash
pnpm add @stripe/stripe-js
```

## Usage

### Creating a Checkout Session
```typescript
import { paymentService } from '@/services/stripe';

const session = await paymentService.createCheckoutSession(
  planId,
  priceId,
  successUrl,
  cancelUrl
);
```

### Using the Checkout Hook
```typescript
import { useStripeCheckout } from '@/hooks/use-stripe-checkout';

const { checkout, isProcessing, error } = useStripeCheckout();

await checkout({
  planId: 'plan_123',
  priceId: 'price_456',
  amount: 1299,
  currency: 'USD',
  returnUrl: 'https://yourapp.com',
});
```

### Component Integration
```typescript
import { StripeCheckoutModal } from '@/components/payment';

<StripeCheckoutModal
  open={checkoutOpen}
  onOpenChange={setCheckoutOpen}
  planId={selectedPlan.id}
  planName={planName}
  amount={amount}
  currency={currency}
  onSuccess={handlePaymentSuccess}
/>
```

## Payment Flow

1. User selects a plan in explore-plans page
2. Clicks "Subscribe" button
3. StripeCheckoutModal opens
4. On confirm, checkout is initiated via backend
5. User is redirected to Stripe hosted checkout page
6. After payment, user is redirected back to success URL
7. Webhook updates subscription status
8. UI refreshes to show active subscription

## Stripe Webhook Events Handled

- `checkout.session.completed` - Checkout completed
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

## Security

- Stripe publishable key is frontend-only
- Secret key is backend-only (never exposed to frontend)
- All API calls include JWT authentication
- Webhook signature verification on backend
- Stripe Elements never touches raw card data on frontend

## Testing

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 9995`

### Testing Checkout
1. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
2. Run backend with test keys
3. Run frontend: `pnpm dev`
4. Navigate to `/account/explore-plans`
