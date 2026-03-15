/**
 * Centralised API client.
 *
 * - axios instance with baseURL from the .env variable EXPO_PUBLIC_API_URL
 * - request interceptor: attaches the stored Bearer token to every request
 * - authApi helpers for login and registration
 */
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every outgoing request automatically.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Typed response shapes
// ---------------------------------------------------------------------------

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  home_address: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export interface MessageResponse {
  message: string;
}

export const authApi = {
  /** POST /auth/login – returns a JWT on success, throws on failure */
  login: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/login", { email, password }),

  /** POST /users/ – create a new account */
  register: (username: string, email: string, password: string) =>
    api.post<UserResponse>("/users/", { username, email, password }),

  /** GET /auth/me – fetch the authenticated user's profile */
  getMe: () => api.get<UserResponse>("/auth/me"),

  /** POST /auth/forgot-password – sends a reset code to the given email */
  forgotPassword: (email: string) =>
    api.post<MessageResponse>("/auth/forgot-password", { email }),

  /** POST /auth/reset-password – validates the code and sets a new password */
  resetPassword: (token: string, new_password: string) =>
    api.post<MessageResponse>("/auth/reset-password", { token, new_password }),
};

export default api;
