import type { User } from "@/lib/types";

export type FilterUsersOptions = {
  currentUserId: string;
  interviewType?: string;
  searchQuery?: string;
};

export function filterUsers(users: User[], options: FilterUsersOptions): User[] {
  throw new Error("Not implemented");
}
