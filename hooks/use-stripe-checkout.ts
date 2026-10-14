import { useState, useCallback } from 'react';
import { paymentService } from '@/services/stripe';
import { toast } from 'react-toastify';

interface UseStripeCheckoutOptions {
  planId: string;
  customerId: string;
}

export function useStripeCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setIsProcessing(false);
  }, []);

  const checkout = useCallback(
    async (options: UseStripeCheckoutOptions) => {
      setIsProcessing(true);
      setError(null);

      try {
        const successUrl = `${window.location.origin}/account/payment-success`;
        const cancelUrl = `${window.location.origin}/account/payment-cancel`;

        const session = await paymentService.createCheckoutSession(
          options.planId,
          options.customerId,
          successUrl,
          cancelUrl,
        );

        // Redirect to Stripe's hosted checkout page where user enters card details
        window.location.href = session.url;
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to create checkout session');
        toast.error(`Payment error: ${err.message}`);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  return {
    checkout,
    isProcessing,
    error,
    reset,
  };
}
