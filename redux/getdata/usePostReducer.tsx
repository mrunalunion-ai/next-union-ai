import { useSelector } from "react-redux";
import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

const selectPosterReducers = createSelector(
  (state: RootState) => state?.combinedReducer,
  (combinedReducer) => ({
    ...combinedReducer?.usePosterReducers,
    access_token: combinedReducer?.user_data?.access_token,
    user_data: combinedReducer?.user_data,
    user: combinedReducer?.user_data?.user,
    ui : combinedReducer?.uiReducer,
    mainReducer : combinedReducer?.mainReducer
  })
);

export const usePosterReducers = () => {
  return useSelector(selectPosterReducers);
};
