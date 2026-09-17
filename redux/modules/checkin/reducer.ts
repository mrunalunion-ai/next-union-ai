import { CheckinActionTypes } from "./action";
import { ICheckinState, initialCheckinState } from "./types";

const checkinReducer = (
  state: ICheckinState = initialCheckinState,
  action: any,
): ICheckinState => {
  switch (action.type) {
    case CheckinActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: "",
      };

    case CheckinActionTypes.SET_ERROR:
      return {
        ...state,
        loading: false,
        submitting: false,
        error: action.payload,
      };

    case CheckinActionTypes.SET_DATA: {
      const answers = { ...state.answers };

      action.payload.questions.forEach((question: any, index: number) => {
        if (question.answer?.score == null) return;

        answers[index] = {
          id: question.answer.id,
          questionId: question.questionId,
          score: question.answer.score,
          comment: question.answer.comment ?? "",
        };
      });

      return {
        ...state,
        relationshipId: action.payload.relationshipId ?? state.relationshipId,
        checkinId: action.payload.checkinId ?? state.checkinId,
        questions: action.payload.questions,
        answers,
        loading: false,
        error: "",
      };
    }

    case CheckinActionTypes.SET_ANSWER:
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.index]: action.payload.answer,
        },
      };

    case CheckinActionTypes.SET_CURRENT_QUESTION:
      return {
        ...state,
        currentQuestion: action.payload,
      };

    case CheckinActionTypes.SET_PARTNER_MESSAGE:
      return {
        ...state,
        partnerMessage: action.payload,
      };

    case CheckinActionTypes.SET_SUBMITTING:
      return {
        ...state,
        submitting: action.payload,
      };

    case CheckinActionTypes.CLEAR:
      return initialCheckinState;

    default:
      return state;
  }
};

export default checkinReducer;
