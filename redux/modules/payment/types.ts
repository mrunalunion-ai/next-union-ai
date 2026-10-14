export interface IPaymentState {
  loading: boolean;
  error: string | null;
  session: ICheckoutSession | null;
  checkoutUrl: string | null;
}

export interface ICheckoutSession {
  id: string;
  url: string;
  status: string;
  customer: string;
  payment_intent: string | null;
  client_secret: string | null;
}

export interface ICreateCheckoutParams {
  planId: string;
  priceId: string;
  planName: string;
  amount: number;
  currency: 'USD' | 'GBP';
  returnUrl: string;
}

export const initialPaymentState: IPaymentState = {
  loading: false,
  error: null,
  session: null,
  checkoutUrl: null,
};
