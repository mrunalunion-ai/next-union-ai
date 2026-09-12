/* eslint-disable @typescript-eslint/no-unused-vars */
import { IUserRes, IUser } from "./types";

export const ActionTypes = {
  AUTH_DATA: "AUTH_DATA",
  IS_LOGIN: "IS_LOGIN",
  ADMIN_LOGOUT: "ADMIN_LOGOUT",
  SET_UPDATE_USER_LOGIN: "SET_UPDATE_USER_LOGIN",
  SET_UPDATE_USER_PERMISSION: "SET_UPDATE_USER_PERMISSION",
  UPDATE_USER_DATA: "UPDATE_USER_DATA",
};

export const setAuthData = (payload: IUserRes) => ({
  type: ActionTypes.AUTH_DATA,
  payload,
});

export const setLogin = (payload: boolean) => ({
  type: ActionTypes.IS_LOGIN,
  payload,
});

export const logoutUser = () => ({
  type: ActionTypes.ADMIN_LOGOUT,
});

export const setUpdateUserLogin = (payload: boolean) => ({
  type: ActionTypes.SET_UPDATE_USER_LOGIN,
  payload,
});
export const setUpdateUserPermission = (payload: any) => ({
  type: ActionTypes.SET_UPDATE_USER_PERMISSION,
  payload,
});

export const updateUserData = (payload: Partial<IUser>) => ({
  type: ActionTypes.UPDATE_USER_DATA,
  payload,
});
