import api, { handleAxiosError } from "./axios";
import { API_BASE_URL } from "./constants";

export interface ErrorResponse {
  message: string;
  error: string;
}

export interface UserProfile {
  username: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  profile_pic?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface HandbookEntry {
  field_name: string;
  field_value: string;
}

export interface HandbookData {
  biography?: string;
  hobbies?: string;
  skills?: string;
  goals?: string;
  notes?: string;
}

export const getUserProfile = async () => {
  try {
    const response = await api.get("/personal/me");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const updateUserProfile = async (formData: UserProfile) => {
  try {
    const request = await api.post("/personal/update", formData);
    return request.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getHandbookInfo = async (): Promise<HandbookEntry[]> => {
  try {
    const response = await api.get("/personal/handbook");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return [];
  }
};

export const updateHandbookField = async (
  fieldName: string,
  fieldValue: string
) => {
  try {
    const response = await api.post("/personal/handbook/update", {
      field_name: fieldName,
      field_value: fieldValue,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};
