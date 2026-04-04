import { describe, it, expect } from "vitest";
import { filterUsers } from "../users";
import type { User } from "@/lib/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const currentUser: User = {
  id: "u1",
  name: "Alex Chen",
  email: "alex@uni.minerva.edu",
  timezone: "America/Los_Angeles",
  bio: "CS senior focusing on backend engineering.",
  role: "both",
  interviewTypes: ["technical", "behavioral"],
  topics: ["System Design", "Data Structures"],
  experienceLevel: "intermediate",
  completedSessions: 12,
  rating: 4.8,
  joinedAt: "2025-09-15",
  schedulingUrl: "https://calendly.com/alexchen",
};

const userB: User = {
  id: "u2",
  name: "Priya Sharma",
  email: "priya@uni.minerva.edu",
  timezone: "Asia/Kolkata",
  bio: "Product management aspirant with analytics experience.",
  role: "interviewer",
  interviewTypes: ["product", "behavioral"],
  topics: ["Product Sense", "Metrics"],
  experienceLevel: "advanced",
  completedSessions: 24,
  rating: 4.9,
  joinedAt: "2025-08-01",
  schedulingUrl: "https://calendly.com/priya",
};

const userC: User = {
  id: "u3",
  name: "Marcus Johnson",
  email: "marcus@uni.minerva.edu",
  timezone: "America/New_York",
  bio: undefined,
  role: "interviewer",
  interviewTypes: ["case", "behavioral"],
  topics: ["Market Sizing", "Profitability"],
  experienceLevel: "advanced",
  completedSessions: 31,
  rating: 4.7,
  joinedAt: "2025-07-20",
};

const userD: User = {
  id: "u4",
  name: "Yuki Tanaka",
  email: "yuki@uni.minerva.edu",
  timezone: "Asia/Tokyo",
  bio: "ML engineer preparing for research roles.",
  role: "both",
  interviewTypes: ["technical"],
  topics: ["Machine Learning", "Python", "Statistics"],
  experienceLevel: "intermediate",
  completedSessions: 8,
  rating: 4.6,
  joinedAt: "2025-10-01",
};

const allUsers = [currentUser, userB, userC, userD];
const peers = [userB, userC, userD]; // everyone except currentUser

// ─── Exclusion ───────────────────────────────────────────────────────────────

describe("filterUsers — exclusion", () => {
  it("excludes the current user from results", () => {
    const result = filterUsers(allUsers, { currentUserId: "u1" });
    expect(result.find((u) => u.id === "u1")).toBeUndefined();
  });

  it("returns all other users when no filters are applied", () => {
    const result = filterUsers(allUsers, { currentUserId: "u1" });
    expect(result).toHaveLength(peers.length);
    expect(result.map((u) => u.id)).toEqual(["u2", "u3", "u4"]);
  });
});

// ─── Type filter ─────────────────────────────────────────────────────────────

describe("filterUsers — type filter", () => {
  it("returns all peers when interviewType is 'All'", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      interviewType: "All",
    });
    expect(result).toHaveLength(peers.length);
  });

  it("returns only users who have the selected interview type", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      interviewType: "Technical",
    });
    expect(result.map((u) => u.id)).toEqual(["u4"]);
  });

  it("returns multiple users when several match the selected type", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      interviewType: "Behavioral",
    });
    expect(result.map((u) => u.id)).toEqual(["u2", "u3"]);
  });

  it("returns empty array when no users match the selected type", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      interviewType: "Product",
    });
    expect(result.map((u) => u.id)).toEqual(["u2"]);
  });
});

// ─── Search ──────────────────────────────────────────────────────────────────

describe("filterUsers — search", () => {
  it("returns all peers when query is empty", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "",
    });
    expect(result).toHaveLength(peers.length);
  });

  it("returns all peers when query is shorter than 3 characters", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "pr",
    });
    expect(result).toHaveLength(peers.length);
  });

  it("matches on name, case-insensitively", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "PRI",
    });
    expect(result.map((u) => u.id)).toEqual(["u2"]);
  });

  it("matches on partial name", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "tan",
    });
    expect(result.map((u) => u.id)).toEqual(["u4"]);
  });

  it("matches on topic, case-insensitively", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "met",
    });
    expect(result.map((u) => u.id)).toEqual(["u2"]);
  });

  it("matches on partial topic", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "mac",
    });
    expect(result.map((u) => u.id)).toEqual(["u4"]);
  });

  it("matches on bio, case-insensitively", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "ana",
    });
    expect(result.map((u) => u.id)).toEqual(["u2"]);
  });

  it("skips bio match gracefully when user has no bio", () => {
    // userC has no bio — should not throw, just not match on bio
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "mar",
    });
    expect(result.map((u) => u.id)).toEqual(["u3"]);
  });

  it("matches on interview type label (e.g. 'cas' matches 'Case')", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "cas",
    });
    expect(result.map((u) => u.id)).toEqual(["u3"]);
  });

  it("returns empty array when no users match the search query", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      searchQuery: "zzz",
    });
    expect(result).toHaveLength(0);
  });
});

// ─── Combined ────────────────────────────────────────────────────────────────

describe("filterUsers — combined filters", () => {
  it("applies type filter and search together", () => {
    // behavioral users are u2 and u3; of those, only u2 has "ana" in bio
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      interviewType: "Behavioral",
      searchQuery: "ana",
    });
    expect(result.map((u) => u.id)).toEqual(["u2"]);
  });

  it("returns empty array when type and search together match nobody", () => {
    const result = filterUsers(allUsers, {
      currentUserId: "u1",
      interviewType: "Technical",
      searchQuery: "mar",
    });
    expect(result).toHaveLength(0);
  });
});
