'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { APP_URL } from '@/constant/static';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useWebSocket } from '@/services/socket/WebSocketContext';
import { usePosterReducers } from '@/redux/getdata/usePostReducer';

export default function PaymentSuccessPage() {
  const { isConnected, sendMessage } = useWebSocket();
  const { user_data } = usePosterReducers();

  useEffect(() => {
    if (isConnected) {
      sendMessage('action', { type: 'userService', action: 'get', payload: {} });
      toast.success('Subscription activated successfully!');
    }
  }, [isConnected, sendMessage]);

  const handleContinue = () => {
    window.location.href = APP_URL.LINKS.CURRENT_PLAN;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full rounded-3xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your subscription has been activated. You now have access to all Premium features.
        </p>
        <Button className="w-full" onClick={handleContinue}>
          Continue to Dashboard
        </Button>
      </Card>
    </div>
  );
}
