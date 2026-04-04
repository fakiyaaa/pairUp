const BASE = process.env.NEXT_PUBLIC_API_URL!;

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  timezone: string;
  experience?: string;
  bio?: string;
  cal_com_link?: string;
};

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const authApi = {
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
