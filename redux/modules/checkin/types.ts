export interface ICheckinAnswer {
  id?: string;
  questionId: string;
  score: number;
  comment: string;
}

export interface ICheckinQuestion {
  questionId: string;
  title: string;
  hint?: string;
  answer?: {
    id?: string;
    score?: number;
    comment?: string;
  } | null;
}

export interface ICheckinState {
  relationshipId: string;
  checkinId: string;
  questions: ICheckinQuestion[];
  answers: Record<number, ICheckinAnswer>;
  currentQuestion: number;
  partnerMessage: string;
  loading: boolean;
  submitting: boolean;
  error: string;
}

export const initialCheckinState: ICheckinState = {
  relationshipId: "",
  checkinId: "",
  questions: [],
  answers: {},
  currentQuestion: 0,
  partnerMessage: "",
  loading: false,
  submitting: false,
  error: "",
};
