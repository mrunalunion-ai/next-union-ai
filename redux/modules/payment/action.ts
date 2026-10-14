export const PAYMENT_LOADING = 'payment/loading';
export const PAYMENT_SUCCESS = 'payment/success';
export const PAYMENT_FAILURE = 'payment/failure';
export const PAYMENT_RESET = 'payment/reset';

export const setLoading = (loading: boolean) => ({
  type: PAYMENT_LOADING,
  payload: loading,
});

export const setSession = (session: any) => ({
  type: PAYMENT_SUCCESS,
  payload: session,
});

export const setError = (error: string) => ({
  type: PAYMENT_FAILURE,
  payload: error,
});

export const resetPayment = () => ({
  type: PAYMENT_RESET,
});
