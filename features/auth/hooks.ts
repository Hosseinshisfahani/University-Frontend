"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ApiError, apiClient } from "@/lib/api/client";
import { authApi } from "./api";
import { useAuthStore } from "./store";
import type { LoginCredentials, RegisterCredentials, User } from "./types";
import { canAccessPortalPath, portalHomeForUser } from "./types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

function normalizeUser<T extends { groups?: string[] }>(user: T): T & { groups: string[] } {
  return { ...user, groups: user.groups ?? [] };
}

function destinationAfterAuth(user: User & { groups: string[] }): string {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const next = params?.get("next");
  if (
    next &&
    (next.startsWith("/admin") ||
      next.startsWith("/patient") ||
      next.startsWith("/therapist")) &&
    canAccessPortalPath(user, next)
  ) {
    return next;
  }
  return portalHomeForUser(user) ?? "/psy";
}

function redirectAfterAuth(
  router: ReturnType<typeof useRouter>,
  user: User & { groups: string[] },
) {
  router.push(destinationAfterAuth(user));
  router.refresh();
}

/** Sends an already-authenticated visitor away from login/register. */
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !user) return;
    router.replace(destinationAfterAuth(normalizeUser(user)));
  }, [isHydrated, isAuthenticated, user, router]);

  return { isHolding: !isHydrated || isAuthenticated };
}

/** Bootstraps CSRF + session on app load; wires 401 → clear session. */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const queryClient = useQueryClient();

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      clearSession();
      queryClient.clear();
    });

    let cancelled = false;

    (async () => {
      try {
        await authApi.ensureCsrf();
        const user = normalizeUser(await authApi.me());
        if (!cancelled) {
          setUser(user);
          queryClient.setQueryData(authKeys.me, user);
        }
      } catch (error) {
        // Only treat real auth failures as logged-out. Transient/network/5xx
        // must not wipe a valid cookie session (e.g. after client navigations).
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 401) {
            clearSession();
            queryClient.clear();
          }
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      apiClient.setUnauthorizedHandler(undefined);
    };
  }, [clearSession, queryClient, setHydrated, setUser]);
}

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const user = normalizeUser(await authApi.me());
        setUser(user);
        return user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          return null;
        }
        throw error;
      }
    },
    enabled: isHydrated,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.clear();
      const user = normalizeUser(data.user);
      setUser(user);
      queryClient.setQueryData(authKeys.me, user);
      redirectAfterAuth(router, user);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: (data) => {
      queryClient.clear();
      const user = normalizeUser(data.user);
      setUser(user);
      queryClient.setQueryData(authKeys.me, user);
      redirectAfterAuth(router, user);
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}
