import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSocialLink,
  deleteSocialLink,
  getDashboard,
  getHandbookInfo,
  getSocialLinks,
  getUserProfile,
  SocialLink,
  updateHandbookField,
  updateSocialLink,
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

export function useAddSocial() {
  const queryClient = useQueryClient();
  return useMutation<
    SocialLink,
    unknown,
    { platform_name: string; username: string; profile_link: string }
  >({
    mutationFn: (data: {
      platform_name: string;
      username: string;
      profile_link: string;
    }) => addSocialLink(data.platform_name, data.username, data.profile_link),
    onSuccess: (newLink) => {
      queryClient.setQueryData<SocialLink[]>(
        ["socialLinks"],
        (oldLinks = []) => [...oldLinks, newLink]
      );
    },
  });
}

export function useUpdateSocial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      link_id: number;
      platform_name: string;
      username: string;
      profile_link: string;
    }) =>
      updateSocialLink(
        data.link_id,
        data.platform_name,
        data.username,
        data.profile_link
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks"] });
    },
  });
}
export function useDeleteSocial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { linkId: number }) =>
      deleteSocialLink(data.linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks"] });
    },
  });
}
