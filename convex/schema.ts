import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(),
  }).index("email", ["email"]),

  sessions: defineTable({
    intervieweeId: v.id("users"),
    interviewerId: v.id("users"),
    status: v.string(),
    scheduledAt: v.string(),
  }),
});
