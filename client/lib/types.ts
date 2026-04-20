export type InterviewType = "technical" | "behavioral" | "case" | "product";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type SessionStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type UserRole = "interviewer" | "interviewee" | "both";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  bio?: string;
  role: UserRole;
  interviewTypes: InterviewType[];
  topics: string[];
  experienceLevel: Difficulty;
  completedSessions: number;
  joinedAt: string;
  schedulingUrl?: string;
}

export interface Session {
  id: string;
  interviewee: User;
  interviewer: User;
  interviewType: InterviewType;
  topics: string[];
  difficulty: Difficulty;
  duration: number;
  scheduledAt: string;
  meetingLink: string;
  status: SessionStatus;
  feedback?: Feedback;
}

export interface Feedback {
  id: string;
  sessionId: string;
  fromUser: User;
  toUser: User;
  communication: number;
  preparedness: number;
  technicalSkill: number;
  notes: string;
  strengths: string;
  improvements: string;
  createdAt: string;
}

