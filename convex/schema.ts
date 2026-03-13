import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    role: v.optional(
      v.union(
        v.literal("interviewer"),
        v.literal("interviewee"),
        v.literal("both"),
      ),
    ),
    timezone: v.optional(v.string()),
    interviewTypes: v.optional(
      v.array(
        v.union(
          v.literal("technical"),
          v.literal("behavioral"),
          v.literal("case"),
          v.literal("product"),
        ),
      ),
    ),
    topics: v.optional(v.array(v.string())),
    experience: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
      ),
    ),
    schedulingUrl: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"]),

  sessions: defineTable({
    intervieweeId: v.id("users"),
    interviewerId: v.id("users"),
    status: v.string(),
    scheduledAt: v.string(),
  }),
});
