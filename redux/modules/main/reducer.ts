/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActionTypes } from "./action";
import { IMainResponse } from "./types";

const initialState: IMainResponse = {
  privacy_policy: null,
  terms_conditions: null,
  loveLanguageList: null,
  relationStatusList: null,
};

const mainReducer = (
  state: IMainResponse = initialState,
  action: any,
): IMainResponse => {
  switch (action.type) {

    case ActionTypes.SET_RELATION_STATUS_LIST: {
      return {
        ...state,
        relationStatusList: {
          data: action?.payload?.data,
          pagination: action?.payload?.pagination,
        },
      };
    }

    case ActionTypes.SET_LOVE_LANGUAGE_LIST: {
      return {
        ...state,
        loveLanguageList: {
          data: action?.payload?.data,
          pagination: action?.payload?.pagination,
        },
      };
    }

    case ActionTypes.SET_PRIVACY_POLICY: {
      return {
        ...state,
        privacy_policy: action.payload,
      };
    }

    case ActionTypes.SET_TERMS_CONDITIONS: {
      return {
        ...state,
        terms_conditions: action.payload,
      };
    }

    case ActionTypes.SET_CLEAR_REDUX: {
      return initialState;
    }

    default:
      return state;
  }
};

export default mainReducer;
