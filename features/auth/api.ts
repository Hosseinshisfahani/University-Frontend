import { apiClient } from "@/lib/api/client";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  User,
} from "./types";

export const authApi = {
  /**
   * Ensures the Django CSRF cookie is present (Set-Cookie from /auth/csrf/).
   * The JSON body is irrelevant — the client later reads `csrftoken` from
   * document.cookie and sends it as X-CSRFToken on mutations.
   */
  ensureCsrf(): Promise<void> {
    return apiClient.ensureCsrfCookie();
  },

  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post("/auth/login/", credentials, { skipRefresh: true });
  },

  register(credentials: RegisterCredentials): Promise<LoginResponse> {
    return apiClient.post("/auth/register/", credentials, { skipRefresh: true });
  },

  logout(): Promise<{ detail: string }> {
    return apiClient.post("/auth/logout/", undefined, { skipRefresh: true });
  },

  me(): Promise<User> {
    return apiClient.get("/auth/me/");
  },
};
