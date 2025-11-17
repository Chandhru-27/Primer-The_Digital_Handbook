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
    const response = await api.get("/auth/me");
    return response.data.logged_in;
  } catch {
    return false;
  }
};

export const logOutUser = async () => {
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
