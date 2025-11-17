import api, { handleAxiosError } from "./axios";

export interface ErrorResponse {
  message: string;
  error: string;
}

export interface UserProfile {
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  profile_pic?: string | null;
  address?: string | null;
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

export interface SocialLink {
  id: number;
  platform_name: string;
  username?: string;
  profile_link: string;
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

export const getSocialLinks = async (): Promise<SocialLink[]> => {
  try {
    const response = await api.get("/social/get-social");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return [];
  }
};

export const addSocialLink = async (
  platformName: string,
  username: string,
  profileLink: string
) => {
  try {
    if (
      profileLink &&
      !profileLink.startsWith("http://") &&
      !profileLink.startsWith("https://")
    ) {
      profileLink = "https://" + profileLink;
    }

    const response = await api.post("/social/add", {
      platform_name: platformName,
      username: username,
      profile_link: profileLink,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const updateSocialLink = async (
  linkId: number,
  platformName: string,
  username: string,
  profileLink: string
) => {
  try {
    if (
      profileLink &&
      !profileLink.startsWith("http://") &&
      !profileLink.startsWith("https://")
    ) {
      profileLink = "https://" + profileLink;
    }

    const response = await api.post(`/social/update/${linkId}`, {
      platform_name: platformName,
      username: username,
      profile_link: profileLink,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteSocialLink = async (linkId: number) => {
  try {
    const response = await api.delete(`/social/delete/${linkId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getDashboard = async () => {
  try {
    const response = await api.get("/api/dashboard");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};
