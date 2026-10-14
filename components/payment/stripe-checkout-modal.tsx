'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useStripeCheckout } from '@/hooks/use-stripe-checkout';
import { Loader2 } from 'lucide-react';

export interface StripeCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  customerId: string;
  amount: number;
  currency: 'USD' | 'GBP';
  onSuccess?: () => void;
}

export function StripeCheckoutModal({
  open,
  onOpenChange,
  planId,
  customerId,
  amount,
  currency,
  onSuccess,
}: StripeCheckoutProps) {
  const { checkout, isProcessing, error } = useStripeCheckout();

  const handleCheckout = async () => {
    const result = await checkout({
      planId,
      customerId,
    });
    if (result) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Secure Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase using our secure payment processor.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-primary/5 border-primary/20 p-5">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">{currency === 'USD' ? '$' : '£'}{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment method</span>
              <span className="font-medium">Card (Stripe secured)</span>
            </div>
          </div>
        </Card>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Pay Securely'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Payments secured by Stripe. Your card details are never stored on our servers.
        </p>
      </DialogContent>
    </Dialog>
  );
}
