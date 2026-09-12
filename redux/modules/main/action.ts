/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ILoveLanguageResponse,
  IPrivacyPolicy,
  IRelationshipStatusResponse,
} from "./types";

export const ActionTypes = {
  SET_CLEAR_REDUX: "SET_CLEAR_REDUX",
  SET_PRIVACY_POLICY: "SET_PRIVACY_POLICY",
  SET_TERMS_CONDITIONS: "SET_TERMS_CONDITIONS",
  SET_LOVE_LANGUAGE_LIST: "SET_LOVE_LANGUAGE_LIST",
  SET_RELATION_STATUS_LIST: "SET_RELATION_STATUS_LIST",
};

export const setRelationStatusList = (payload: IRelationshipStatusResponse) => {
  return {
    type: ActionTypes.SET_RELATION_STATUS_LIST,
    payload,
  };
};

export const setLoveLanguageList = (payload: ILoveLanguageResponse) => {
  return {
    type: ActionTypes.SET_LOVE_LANGUAGE_LIST,
    payload,
  };
};

export const setPrivacyPolicy = (payload: IPrivacyPolicy) => {
  return {
    type: ActionTypes.SET_PRIVACY_POLICY,
    payload,
  };
};

export const setTermsConditions = (payload: IPrivacyPolicy) => {
  return {
    type: ActionTypes.SET_TERMS_CONDITIONS,
    payload,
  };
};

export const setReduxClear = () => ({
  type: ActionTypes.SET_CLEAR_REDUX,
});