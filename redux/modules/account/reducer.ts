import { AccountActionTypes } from "./action";
import { IAccountState, initialAccountState } from "./types";

const accountReducer = (state: IAccountState = initialAccountState, action: any): IAccountState => {
  switch (action.type) {
    case AccountActionTypes.SET_LOADING: return { ...state, loading: action.payload, error: "" };
    case AccountActionTypes.SET_SAVING: return { ...state, saving: action.payload };
    case AccountActionTypes.SET_PLANS: return { ...state, plans: action.payload, loading: false };
    case AccountActionTypes.SET_ACTIVE_SUBSCRIPTION: return { ...state, activeSubscription: action.payload, loading: false };
    case AccountActionTypes.SET_TRANSACTIONS: return { ...state, transactions: action.payload, loading: false };
    case AccountActionTypes.SET_PARTNER: return { ...state, partner: action.payload, loading: false };
    case AccountActionTypes.SET_LEGAL: return { ...state, legal: { ...state.legal, [action.payload.type]: action.payload.page }, loading: false };
    case AccountActionTypes.SET_ERROR: return { ...state, loading: false, saving: false, error: action.payload };
    case AccountActionTypes.CLEAR: return initialAccountState;
    default: return state;
  }
};

export default accountReducer;
