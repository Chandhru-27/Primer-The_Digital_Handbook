import { handleAxiosError } from "./axios";
import api from "./axios";

export interface VaultEntry {
  id: number;
  domain: string;
  account_name: string;
  pin_or_password?: string;
  url?: string;
  notes?: string | null;
}

export interface VaultEntryInput {
  domain: string;
  account_name: string;
  pin_or_password: string;
  url?: string;
  notes?: string | null;
}

export const addVaultEntry = async (entry: VaultEntryInput) => {
  try {
    const response = await api.post("/vault/add", entry);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getVaultEntries = async () => {
  try {
    const response = await api.get<VaultEntry[]>("/vault/get-vault");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const viewVaultEntry = async (
  entryId: number,
  vaultPassword: string
) => {
  try {
    const response = await api.post(`/vault/view`, {
      entry_id: entryId,
      vault_password: vaultPassword,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const updateVaultEntry = async (
  entryId: number,
  updates: Partial<VaultEntryInput>
) => {
  try {
    const response = await api.post(`/vault/update/${entryId}`, updates);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const deleteVaultEntry = async (entryId: number) => {
  try {
    const response = await api.delete(`/vault/delete/${entryId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};
