/**
 * Waitlist API layer
 *
 * Handles joining and checking status for the Copilot Tasks waitlist.
 * Built on top of React Query for caching and the app's fetchApi utility.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useIsAuthenticated } from "@/lib/auth";
import { joinResponseSchema, statusResponseSchema } from "@/lib/schemas";
import { WAITLIST_PROGRAM } from "../constants";

// ===================== API Functions =====================

async function joinWaitlist(program: string) {
  const encodedProgram = encodeURIComponent(program);
  const { data } = await fetchApi(`/waitlist/${encodedProgram}/join`, joinResponseSchema, {
    options: { method: "POST" },
    analytics: { anonymousPath: "/waitlist/{program}/join" },
  });
  return data;
}

async function getWaitlistStatus(program: string) {
  const encodedProgram = encodeURIComponent(program);
  const { data } = await fetchApi(
    `/waitlist/${encodedProgram}/status`,
    statusResponseSchema,
    {
      analytics: { anonymousPath: "/waitlist/{program}/status" },
    },
  );
  return data;
}

// ===================== Query Key =====================

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

function getWaitlistQueryKey(program: string) {
  return ["waitlistStatus", program];
}

// ===================== React Query Hooks =====================

/**
 * Check the current user's waitlist status.
 * Only fetches when the user is authenticated.
 */
export function useWaitlistStatus(program: string = WAITLIST_PROGRAM) {
  const isAuthenticated = useIsAuthenticated();

  const { data, isLoading } = useQuery({
    queryKey: getWaitlistQueryKey(program),
    queryFn: () => getWaitlistStatus(program),
    staleTime: STALE_TIME,
    enabled: isAuthenticated,
  });

  return {
    status: data?.status as string | undefined,
    isLoading,
  };
}

/**
 * Join the waitlist. Invalidates the status query on success.
 */
export function useJoinWaitlist(program: string = WAITLIST_PROGRAM) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => joinWaitlist(program),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getWaitlistQueryKey(program),
      });
    },
  });

  return {
    join: () => mutation.mutate(),
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
}
