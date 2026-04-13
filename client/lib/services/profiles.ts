import { get } from "@/lib/services/api";

export type ProfileUser = {
  id: string;
  full_name: string;
  timezone: string;
  experience: string;
  bio: string;
  cal_com_link: string;
  interview_types: string[];
};

export const profilesApi = {
  list: () => get<ProfileUser[]>("/profiles/"),
};
