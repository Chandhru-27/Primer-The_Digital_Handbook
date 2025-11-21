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
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
    }
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const checkLoginStatus = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  try {
    const response = await api.get("/auth/me");
    return response.data.logged_in;
  } catch {
    return false;
  }
};

export const logOutUser = async () => {
  localStorage.removeItem("access_token");
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const setVaultPassword = async (password: string) => {
  try {
    const response = await api.post("/vault/set_password", {
      vault_password: password,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const unlockVault = async (password: string) => {
  try {
    const response = await api.post("/vault/unlock-vault", {
      vault_password: password,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};
