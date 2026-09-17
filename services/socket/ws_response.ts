import { IUserRes } from "@/redux/modules/common/user_data/types";
import { updateUserData } from "@/redux/modules/common/user_data/action";
import {
  setCheckInQuesList,
  setLoveLanguageList,
  setRelationStatusList
} from "@/redux/modules/main/action";
import {
  setCheckinData,
  setCheckinError,
  setCheckinSubmitting,
} from "@/redux/modules/checkin";
import { toast } from "react-toastify";

export const ws_response = (
  { evt }: { evt: { event: string; data: any } },
  navigate: any,
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => void,
  user_data: IUserRes,
) => {
  return async (
    dispatch: any,
    getState: () => {
      (): any;
      new(): any;
      adminReducers: { device_id: string; access_token: string };
    },
  ) => {
    const ws_onmessage = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;

    switch (ws_onmessage?.request?.type) {

      case "userService":
        if (ws_onmessage?.request?.action === "update") {
          if (ws_onmessage?.status === true) {
            toast.success(ws_onmessage?.msg)
          } else {
            toast.error(ws_onmessage?.msg)
          }
        }

        if (ws_onmessage?.request?.action === "get") {
          if (ws_onmessage?.status === true) {
            dispatch(updateUserData(ws_onmessage?.data));
          } else {
            toast.error(ws_onmessage?.msg);
            dispatch(updateUserData(ws_onmessage?.data));
          }
        }
        break;

      case "loveLanguageService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            dispatch(setLoveLanguageList(ws_onmessage?.data));
          } else {
            dispatch(setLoveLanguageList(ws_onmessage?.data));
          }
        }
        break;

      case "relationStatusService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            dispatch(setRelationStatusList(ws_onmessage?.data));
          } else {
            dispatch(setRelationStatusList(ws_onmessage?.data));
          }
        }
        break;

      case "checkinQuesService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            dispatch(setCheckInQuesList(ws_onmessage?.data));
          } else {
            dispatch(setCheckInQuesList(ws_onmessage?.data));
          }
        }
        break;

      case "checkinService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            const data = ws_onmessage?.data ?? {};
            const checkin = Array.isArray(data?.questions)
              ? data
              : Array.isArray(data?.data)
                ? data.data[0]
                : data;

            dispatch(
              setCheckinData({
                relationshipId: checkin?.relationshipId,
                checkinId: checkin?.checkinId ?? checkin?.id,
                questions: Array.isArray(checkin?.questions)
                  ? checkin.questions
                  : [],
              }),
            );
          } else {
            dispatch(
              setCheckinError(
                ws_onmessage?.msg ??
                  ws_onmessage?.message ??
                  "Unable to load your weekly check-in.",
              ),
            );
          }
        }

        if (ws_onmessage?.request?.action === "submit") {
          dispatch(setCheckinSubmitting(false));

          if (ws_onmessage?.status === false) {
            dispatch(
              setCheckinError(
                ws_onmessage?.msg ??
                  ws_onmessage?.message ??
                  "Unable to save your check-in.",
              ),
            );
          }
        }
        break;

      default:
        return;
    }
  };
};
