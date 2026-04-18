const BASE =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://127.0.0.1:5001";

type SessionFeedbackPayload = {
  from_user_id: string;
  from_user_name: string;
  to_user_id?: string;
  communication: number;
  preparedness: number;
  technical_skill: number;
  strengths?: string;
  improvements?: string;
  notes?: string;
};

export type PersistedFeedback = {
  id: string;
  session_id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id?: string;
  communication: number;
  preparedness: number;
  technical_skill: number;
  strengths?: string;
  improvements?: string;
  notes?: string;
  created_at: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
  });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error)
        : "Request failed";
    throw new Error(message);
  }

  if (!isJson) throw new Error("Server returned an unexpected response.");
  return data as T;
}

export const sessionsApi = {
  getFeedback: (sessionId: string) =>
    request<{ feedback: PersistedFeedback | null }>(
      `/sessions/${sessionId}/feedback`,
    ),

  createFeedback: (sessionId: string, payload: SessionFeedbackPayload) =>
    request<{ feedback: PersistedFeedback }>(`/sessions/${sessionId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};
