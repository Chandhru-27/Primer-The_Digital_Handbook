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
import {
  addVaultEntry,
  getVaultEntries,
  deleteVaultEntry,
  updateVaultEntry,
  VaultEntry,
  VaultEntryInput,
} from "../api/vault";
import { unlockVault } from "../api/auth";

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

export function useVaultEntries(enabled: boolean) {
  return useQuery({
    queryKey: ["vaultEntries"],
    queryFn: getVaultEntries,
    enabled: enabled,
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

export function useUnlockVault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { password: string }) =>
      unlockVault(data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaultEntries"] });
    },
  });
}

export function useAddVaultEntry() {
  const queryClient = useQueryClient();

  return useMutation<
    VaultEntry,
    unknown,
    VaultEntryInput,
    { previousEntries?: VaultEntry[]; tempId?: number }
  >({
    mutationFn: (data: VaultEntryInput) => addVaultEntry(data),

    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ["vaultEntries"] });

      const previousEntries = queryClient.getQueryData<VaultEntry[]>([
        "vaultEntries",
      ]);

      const tempId = Date.now() * -1; 
      const tempEntry: VaultEntry = {
        id: tempId,
        domain: newEntry.domain,
        account_name: newEntry.account_name,
        url: newEntry.url,
        notes: newEntry.notes || null,
      };

      queryClient.setQueryData<VaultEntry[]>(["vaultEntries"], (old = []) => [
        ...(old || []),
        tempEntry,
      ]);

      return { previousEntries, tempId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["vaultEntries"], context.previousEntries);
      }
    },

    onSuccess: (createdEntry, _vars, context) => {
      if (context?.tempId) {
        queryClient.setQueryData<VaultEntry[]>(["vaultEntries"], (old = []) =>
          (old || []).map((entry) =>
            entry.id === context.tempId ? createdEntry : entry
          )
        );
      } else {
        queryClient.setQueryData<VaultEntry[]>(["vaultEntries"], (old = []) => [
          ...(old || []),
          createdEntry,
        ]);
      }

      queryClient.invalidateQueries({ queryKey: ["vaultEntries"] });
    },
  });
}

export function useUpdateVaultEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<VaultEntryInput>;
    }) => updateVaultEntry(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["vaultEntries"] });

      const previousEntries = queryClient.getQueryData<VaultEntry[]>([
        "vaultEntries",
      ]);

      queryClient.setQueryData<VaultEntry[]>(["vaultEntries"], (old = []) =>
        old.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
      );

      return { previousEntries };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["vaultEntries"], context.previousEntries);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vaultEntries"] });
    },
  });
}

export function useDeleteVaultEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      return deleteVaultEntry(id);
    },
    onMutate: async ({ id }: { id: number }) => {
      await queryClient.cancelQueries({ queryKey: ["vaultEntries"] });

      const previousEntries = queryClient.getQueryData<VaultEntry[]>([
        "vaultEntries",
      ]);

      queryClient.setQueryData<VaultEntry[]>(["vaultEntries"], (old = []) =>
        (old || []).filter((entry) => entry.id !== id)
      );

      return { previousEntries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["vaultEntries"], context.previousEntries);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vaultEntries"] });
    },
  });
}
