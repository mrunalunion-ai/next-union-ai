'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PaymentCancelPage() {
  const handleBack = () => {
    window.location.href = '/account/explore-plans';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full rounded-3xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <X className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your subscription was not completed. You can try again whenever you're ready.
        </p>
        <Button className="w-full" variant="outline" onClick={handleBack}>
          Back to Plans
        </Button>
      </Card>
    </div>
  );
}
