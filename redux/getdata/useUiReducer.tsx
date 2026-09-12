import { useSelector } from "react-redux";
import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

const selectPosterReducers = createSelector(
  (state: RootState) => state.combinedReducer,
  (combinedReducer) => ({
    ...combinedReducer?.uiReducer,
    formContent: combinedReducer?.uiReducer?.formContent,
    ModalPopup: combinedReducer?.uiReducer?.ModalPopup,
    requestLoader: combinedReducer?.uiReducer?.requestLoader,
    formloader:combinedReducer?.uiReducer?.formloader,
    randomNo:combinedReducer?.uiReducer?.randomNo,
  })
)
export const useUiReducer = () => {
    return useSelector(selectPosterReducers);
};