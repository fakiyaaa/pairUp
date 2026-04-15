import { get, post } from "@/lib/services/api";

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  timezone: string;
  experience?: string;
  bio?: string;
  cal_com_link?: string;
};

export const authApi = {
  /**
   * Fetch the currently authenticated user.
   */
  me: () => get<{ user: AuthUser }>("/auth/me"),

  /**
   * Log in a user with email and password.
   */
  login: (email: string, password: string) =>
    post<{ user: AuthUser }>("/auth/login", { email, password }),

  /**
   * Create a new user account.
   */
  signup: (payload: {
    full_name: string;
    email: string;
    password: string;
    timezone: string;
    experience?: string;
    cal_com_link?: string;
  }) => post<{ user: AuthUser }>("/auth/signup", payload),

  /**
   * Log out the current user.
   */
  logout: () => post<{ message: string }>("/auth/logout"),
};