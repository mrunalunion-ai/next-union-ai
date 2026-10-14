import { initialPaymentState } from './types';
import {
  PAYMENT_LOADING,
  PAYMENT_SUCCESS,
  PAYMENT_FAILURE,
  PAYMENT_RESET,
} from './action';

const paymentReducer = (state = initialPaymentState, action: any) => {
  switch (action.type) {
    case PAYMENT_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };
    case PAYMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        session: action.payload,
        checkoutUrl: action.payload?.url || null,
      };
    case PAYMENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case PAYMENT_RESET:
      return initialPaymentState;
    default:
      return state;
  }
};

export default paymentReducer;
