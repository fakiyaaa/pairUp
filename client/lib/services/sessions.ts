import { get, post } from "@/lib/services/api";

export type ApiSession = {
  id: string;
  status: string;
  scheduled_at: string;
  meeting_link: string | null;
  interview_type: string | null;
  interviewer_id: string;
  interviewer_name: string;
  interviewer_email: string;
  interviewer_timezone: string;
  interviewer_bio: string | null;
  interviewer_cal_com_link: string | null;
  interviewee_id: string;
  interviewee_name: string;
  interviewee_email: string;
  interviewee_timezone: string;
  interviewee_bio: string | null;
  interviewee_cal_com_link: string | null;
};

export type SessionFeedbackPayload = {
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

export const sessionsApi = {
  listUpcoming: () => get<ApiSession[]>("/sessions/"),
  listCompleted: () => get<ApiSession[]>("/sessions/completed"),
  get: (id: string) => get<ApiSession>(`/sessions/${id}`),

  getFeedback: (sessionId: string) =>
    get<{ feedback: PersistedFeedback | null }>(
      `/sessions/${sessionId}/feedback`,
    ),

  createFeedback: (sessionId: string, payload: SessionFeedbackPayload) =>
    post<{ feedback: PersistedFeedback }>(
      `/sessions/${sessionId}/feedback`,
      payload,
    ),
};
