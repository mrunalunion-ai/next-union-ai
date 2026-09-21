import {
  IAccountLegalPage,
  IAccountPartner,
  IAccountPlan,
  IAccountSubscription,
  IAccountTransaction,
  LegalPageType,
} from "./types";

export const AccountActionTypes = {
  SET_LOADING: "ACCOUNT_SET_LOADING",
  SET_SAVING: "ACCOUNT_SET_SAVING",
  SET_PLANS: "ACCOUNT_SET_PLANS",
  SET_ACTIVE_SUBSCRIPTION: "ACCOUNT_SET_ACTIVE_SUBSCRIPTION",
  SET_TRANSACTIONS: "ACCOUNT_SET_TRANSACTIONS",
  SET_PARTNER: "ACCOUNT_SET_PARTNER",
  SET_LEGAL: "ACCOUNT_SET_LEGAL",
  SET_ERROR: "ACCOUNT_SET_ERROR",
  CLEAR: "ACCOUNT_CLEAR",
};

export const setAccountLoading = (payload: boolean) => ({ type: AccountActionTypes.SET_LOADING, payload });
export const setAccountSaving = (payload: boolean) => ({ type: AccountActionTypes.SET_SAVING, payload });
export const setAccountPlans = (payload: IAccountPlan[]) => ({ type: AccountActionTypes.SET_PLANS, payload });
export const setActiveSubscription = (payload: IAccountSubscription | null) => ({ type: AccountActionTypes.SET_ACTIVE_SUBSCRIPTION, payload });
export const setAccountTransactions = (payload: IAccountTransaction[]) => ({ type: AccountActionTypes.SET_TRANSACTIONS, payload });
export const setAccountPartner = (payload: IAccountPartner | null) => ({ type: AccountActionTypes.SET_PARTNER, payload });
export const setAccountLegal = (payload: { type: LegalPageType; page: IAccountLegalPage }) => ({ type: AccountActionTypes.SET_LEGAL, payload });
export const setAccountError = (payload: string) => ({ type: AccountActionTypes.SET_ERROR, payload });
export const clearAccount = () => ({ type: AccountActionTypes.CLEAR });
