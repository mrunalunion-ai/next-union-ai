/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActionTypes } from "./action";
import { IUserRes } from "./types";

const initialState: IUserRes = {
  status: "",
  is_Login: false,
  user: undefined,
  access_token: "",
};

const userDataReducers = (
  state: IUserRes = initialState,
  action: any
): IUserRes => {
  switch (action.type) {
    case ActionTypes.AUTH_DATA: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case ActionTypes.IS_LOGIN: {
      return {
        ...state,
        is_Login: action.payload,
      };
    }
    case ActionTypes.SET_UPDATE_USER_LOGIN: {
      const column_permissions = action?.payload?.column_permissions
        ? JSON.parse(action?.payload?.column_permissions)
        : null;
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state?.user,
        },
        // is_Login:action.payload,
      };
    }
    case ActionTypes.SET_UPDATE_USER_PERMISSION: {
      const column_permissions = action?.payload?.column_permissions
        ? JSON.parse(action?.payload?.column_permissions)
        : null;
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state?.user,
        },
      };
    }

    case ActionTypes.UPDATE_USER_DATA: {
      if (!state.user) return state;

      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    }

    case ActionTypes.ADMIN_LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};

export default userDataReducers;
