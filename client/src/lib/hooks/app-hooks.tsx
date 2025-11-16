import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDashboard,
  getHandbookInfo,
  getSocialLinks,
  getUserProfile,
  updateHandbookField,
  updateUserProfile,
} from "../api/user";
import { getVaultEntries } from "../api/vault";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["socialLinks"],
    queryFn: getSocialLinks,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useVaultEntries() {
  return useQuery({
    queryKey: ["vaultEntries"],
    queryFn: getVaultEntries,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useFetchHandbook() {
  return useQuery({
    queryKey: ["handbook"],
    queryFn: getHandbookInfo,
  });
}

export function useUpdateHandbook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { field_name: string; field_value: string }) =>
      updateHandbookField(data.field_name, data.field_value),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handbook"] });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

