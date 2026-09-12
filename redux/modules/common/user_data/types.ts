/* eslint-disable @typescript-eslint/no-unused-vars */

import { ILoveLanguage, IRelationshipStatus } from "../../main/types";

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  phoneDialingCode: string;
  phoneCountry: string;
  gender: string;
  dob: string;
  country: string;
  profileImage: string | null;
  summary: string;
  userType: string;
  active: boolean;
  onboardingStep: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  loveLanguages: ILoveLanguage[];
  relationships: IRelationship[];
}

export interface IRelationship {
  id: string;
  user1Id: string;
  user2Id: string | null;
  unionCode: string;
  relationStatusId: string;
  date: string;
  children: number;
  sendRequest: boolean;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  relationStatus: IRelationshipStatus;
  partner: IPartner | null;
  subscription: ISubscription;
}

export interface IPartner {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  phoneDialingCode?: string;
  phoneCountry?: string;
  gender?: string;
  dob?: string;
  country?: string;
  profileImage?: string | null;
  summary?: string;
  userType?: string;
  active?: boolean;
  onboardingStep?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  loveLanguages?: ILoveLanguage[];
}

export interface ISubscription {
  subscriptionEligibility: ISubscriptionEligibility;
}

export interface ISubscriptionEligibility {
  hasUsedFirstPurchaseTrial: boolean;
  canUseFirstPurchaseTrial: boolean;
}

export interface IChangePasswordTypes {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}
export interface IUserApiType {
  status: string;
  user: IUser;
  access_token: string;
}

export interface IUserRes {
  user_data?: IUserApiType;
  is_Login: boolean;
  access_token: string;
  status?: any;
  user?: IUser;
  designation?:
  | "director"
  | "project_manager"
  | "team_lead"
  | "quality_assurance"
  | "detailer"
  | "";
}
