const BASE = process.env.NEXT_PUBLIC_API_URL!;

export type UpcomingSession = {
  id: string;
  status: string;
  scheduled_at: string;
  meeting_link: string;
  interview_type: string;
  partner_name: string;
};

export type ProfileData = {
  id: string;
  full_name: string;
  email: string;
  timezone: string;
  experience: string;
  bio: string;
  cal_com_link: string;
  role: string;
  interview_types: string[];
  topics: string[];
  upcoming_sessions: UpcomingSession[];
  created_at: string;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: options?.body
      ? { "Content-Type": "application/json", ...options.headers }
      : options?.headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const profileApi = {
  getMe: () => apiFetch<ProfileData>("/profiles/me"),

  updateMe: (body: Partial<ProfileData>) =>
    apiFetch<ProfileData>("/profiles/me", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getPublic: (userId: string) => apiFetch<ProfileData>(`/profiles/${userId}`),
};
