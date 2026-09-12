import { createReducer } from "@reduxjs/toolkit";
import { Action, ActionTypes } from "../../../actions/action";

const initialData: any = {
  socketResponse: {
    data: null,
    errors: null,
    request: null,
    action: "",
    status: "",
    type: "",
    payload: [],
  }

};

const posterReducer = createReducer(initialData, (builder) => {
  builder.addCase(ActionTypes.SET_STORE_SOCKET_RESPONSE, (state, action: Action) => {
    return {
      ...state,
      socketResponse: action?.payload ? action?.payload : initialData.socketResponse,
    }
  });
});

export default posterReducer;
