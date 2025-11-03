import { handleAxiosError } from "./axios";
import api from "./axios";

export interface AuthResponse {
  message: string;
  user_id?: number;
  error?: string;
}

interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

interface SignInFormData {
  username: string;
  password: string;
}

export const signUp = async (formData: SignupFormData) => {
  try {
    const response = await api.post("/auth/signup", formData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const signIn = async (formData: SignInFormData) => {
  try {
    const response = await api.post("/auth/signin", formData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const checkLoginStatus = async () => {
  try {
    const response = await api.get("/auth/me")
    return response.data.logged_in;
  } catch {
    return false;
  }
};

export const logout = () => {
  // Clear any stored auth data
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  // Additional logout logic can be added here
};
