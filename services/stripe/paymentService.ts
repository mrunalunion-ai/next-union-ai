import axios from 'axios';
import { API_BASE_URL } from '@/constant/static';

export interface CheckoutSessionResponse {
  id: string;
  url: string;
  status: string;
  customer: string;
  client_secret?: string;
}

class PaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  async createCheckoutSession(
    planId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResponse> {
    const token = this.getToken();
    const response = await axios.post(
      `${this.baseURL}/api/stripe/checkout`,
      {
        planId,
        customerId,
        successUrl,
        cancelUrl,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create checkout session');
    }
    return {
      id: response.data.data.sessionId,
      url: response.data.data.checkoutUrl,
      status: 'open',
      customer: customerId,
    };
  }

  async getSubscription(relationshipId: string): Promise<any> {
    const token = this.getToken();
    const response = await axios.get(
      `${this.baseURL}/api/stripe/subscription?relationshipId=${relationshipId}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data;
  }

  async upgradeSubscription(
    relationshipId: string,
    newPlanId: string,
  ): Promise<any> {
    const token = this.getToken();
    const response = await axios.post(
      `${this.baseURL}/api/stripe/subscription/upgrade?relationshipId=${relationshipId}`,
      { newPlanId },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data;
  }

  async cancelSubscription(
    relationshipId: string,
    cancelAtPeriodEnd: boolean,
  ): Promise<any> {
    const token = this.getToken();
    const response = await axios.post(
      `${this.baseURL}/api/stripe/subscription/cancel?relationshipId=${relationshipId}`,
      { cancelAtPeriodEnd },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data;
  }

  async resumeSubscription(relationshipId: string): Promise<any> {
    const token = this.getToken();
    const response = await axios.post(
      `${this.baseURL}/api/stripe/subscription/resume?relationshipId=${relationshipId}`,
      {},
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data;
  }

  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<any> {
    const token = this.getToken();
    const response = await axios.post(
      `${this.baseURL}/api/stripe/portal?customerId=${customerId}`,
      { returnUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data;
  }
}

export const paymentService = new PaymentService();
