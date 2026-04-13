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
  me: () => get<{ user: AuthUser }>("/auth/me"),

  login: (email: string, password: string) =>
    post<{ user: AuthUser }>("/auth/login", { email, password }),

  signup: (payload: {
    full_name: string;
    email: string;
    password: string;
    timezone: string;
    experience?: string;
    cal_com_link?: string;
  }) => post<{ user: AuthUser }>("/auth/signup", payload),

  logout: () => post<{ message: string }>("/auth/logout"),
};
