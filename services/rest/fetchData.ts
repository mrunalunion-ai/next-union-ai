import { API_BASE_URL } from "@/constant/static";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";

export type ContentType =
  | "application/json"
  | "multipart/form-data";

export const AuthReq = async (
  url: string,
  data_req: any
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data_req),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("AuthReq Error:", error);
    toast.error(error as any);
    return error;
  }
};

export const fetchData = async <T = any>(
  url: string,
  method: AxiosRequestConfig["method"] = "GET",
  headers: Record<string, string> = {},
  data?: any,
  params?: Record<string, any>
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      headers,
      data,
      params,
    });

    return response;
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    if (axiosError.response) {
      const errorMessage =
        axiosError.response.data?.error ||
        axiosError.response.data?.message ||
        "An error occurred";

      if (errorMessage !== "Unauthorized") {
        toast.error(errorMessage);
      }

      throw axiosError;
    }

    if (axiosError.request) {
      toast.error("No response received from server.");
      console.error("No response received:", axiosError.request);

      throw new Error("No response received from server.");
    }

    const errorMessage =
      axiosError.message || "Request failed";

    toast.error(errorMessage);
    console.error("Request failed:", errorMessage);

    throw new Error(errorMessage);
  }
};

export const postData = async <T = any>(
  url: string,
  data_req?: any,
  token?: string,
  content_type: ContentType = "application/json"
): Promise<AxiosResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    
    if (content_type === "application/json") {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return await fetchData<T>(
      url,
      "POST",
      headers,
      data_req
    );
  } catch (error) {
    console.error("postData Error:", error);
    throw error;
  }
};