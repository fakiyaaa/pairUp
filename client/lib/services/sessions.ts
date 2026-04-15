import { get } from "@/lib/services/api";
import type { Feedback } from "@/lib/types";

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
  feedback?: Feedback;
};

export const sessionsApi = {
  listUpcoming: () => get<ApiSession[]>("/sessions/"),
  listCompleted: () => get<ApiSession[]>("/sessions/completed"),
  get: (id: string) => get<ApiSession>(`/sessions/${id}`),
};
