interface IPagination {
  totalPages: number;
  currentPage: number;
  pageLimit: number;
  totalCount?: number;
}

export interface ILoveLanguage {
  id: string;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ILoveLanguageResponse{
  data: ILoveLanguage[],
  pagination: IPagination
}

export interface IPrivacyPolicy {
  _id: string;
  title: string;
  description: string;
  status: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface IRelationshipStatus {
  id: string;
  title: string;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IRelationshipStatusResponse{
  data: IRelationshipStatus[],
  pagination: IPagination
}

export interface IMainResponse {
  relationStatusList: IRelationshipStatusResponse | null;
  loveLanguageList: ILoveLanguageResponse | null;
  privacy_policy: IPrivacyPolicy | null;
  terms_conditions: IPrivacyPolicy | null;
}
