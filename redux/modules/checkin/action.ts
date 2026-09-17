import { ICheckinAnswer, ICheckinQuestion } from "./types";

export const CheckinActionTypes = {
  SET_LOADING: "CHECKIN_SET_LOADING",
  SET_ERROR: "CHECKIN_SET_ERROR",
  SET_DATA: "CHECKIN_SET_DATA",
  SET_ANSWER: "CHECKIN_SET_ANSWER",
  SET_CURRENT_QUESTION: "CHECKIN_SET_CURRENT_QUESTION",
  SET_PARTNER_MESSAGE: "CHECKIN_SET_PARTNER_MESSAGE",
  SET_SUBMITTING: "CHECKIN_SET_SUBMITTING",
  CLEAR: "CHECKIN_CLEAR",
};

export const setCheckinLoading = (payload: boolean) => ({
  type: CheckinActionTypes.SET_LOADING,
  payload,
});

export const setCheckinError = (payload: string) => ({
  type: CheckinActionTypes.SET_ERROR,
  payload,
});

export const setCheckinData = (payload: {
  relationshipId?: string;
  checkinId?: string;
  questions: ICheckinQuestion[];
}) => ({
  type: CheckinActionTypes.SET_DATA,
  payload,
});

export const setCheckinAnswer = (payload: {
  index: number;
  answer: ICheckinAnswer;
}) => ({
  type: CheckinActionTypes.SET_ANSWER,
  payload,
});

export const setCheckinCurrentQuestion = (payload: number) => ({
  type: CheckinActionTypes.SET_CURRENT_QUESTION,
  payload,
});

export const setCheckinPartnerMessage = (payload: string) => ({
  type: CheckinActionTypes.SET_PARTNER_MESSAGE,
  payload,
});

export const setCheckinSubmitting = (payload: boolean) => ({
  type: CheckinActionTypes.SET_SUBMITTING,
  payload,
});

export const clearCheckin = () => ({
  type: CheckinActionTypes.CLEAR,
});
