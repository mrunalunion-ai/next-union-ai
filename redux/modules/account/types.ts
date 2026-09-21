export type LegalPageType = "terms" | "privacy" | "subscription";

export interface IAccountPlan {
  id: string;
  name: string;
  code: string;
  duration: number;
  durationUnit: string;
  priceUSD: number;
  priceGBP: number;
  trialDays: number;
  isPopular: boolean;
  isBestValue: boolean;
}

export interface IAccountSubscription {
  id: string;
  planId: string;
  planName: string;
  planCode: string;
  status: string;
  ownerUserId: string;
  startDate?: string;
  endDate?: string;
  isTrial: boolean;
  autoRenew: boolean;
  isActive?: boolean;
}

export interface IAccountTransaction {
  id: string;
  transactionId: string;
  planName: string;
  amount: number;
  currency: string;
  date?: string;
  status: string;
  paymentMethod: string;
  platform: string;
  paymentCreatedBy: string;
}

export interface IAccountPartner {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  phoneDialingCode?: string;
  phoneCountry?: string;
  gender?: string;
  dob?: string;
  country?: string;
  profileImage?: string | null;
  summary?: string;
  loveLanguages?: Array<{ id?: string; title?: string; icon?: string }>;
}

export interface IAccountLegalPage {
  id: string;
  type: string;
  pageContent: string;
  active: boolean;
}

export interface IAccountState {
  plans: IAccountPlan[];
  activeSubscription: IAccountSubscription | null;
  transactions: IAccountTransaction[];
  partner: IAccountPartner | null;
  legal: Partial<Record<LegalPageType, IAccountLegalPage>>;
  loading: boolean;
  saving: boolean;
  error: string;
}

export const initialAccountState: IAccountState = {
  plans: [],
  activeSubscription: null,
  transactions: [],
  partner: null,
  legal: {},
  loading: false,
  saving: false,
  error: "",
};
