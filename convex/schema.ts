import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Reused across userPreferences and sessions
const roleValidator = v.union(
  v.literal("interviewee"),
  v.literal("interviewer"),
  v.literal("both")
);

export default defineSchema({

  // -------------------------
  // Reference / lookup tables
  // -------------------------

  interviewTypes: defineTable({
    // e.g. "Technical", "Behavioural", "System Design"
    name: v.string(),
  }).index("by_name", ["name"]),

  topics: defineTable({
    // e.g. "Arrays", "Leadership", "Distributed Systems"
    name: v.string(),
    interviewTypeId: v.id("interviewTypes"),
  })
    .index("by_name", ["name"])
    .index("by_interviewType", ["interviewTypeId"]),

  // -------------------------
  // Users
  // -------------------------

  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    timezone: v.string(),
    experience: v.string(),
    bio: v.optional(v.string()),
    calComLink: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // -------------------------
  // User preferences
  // Used to filter/match users before a session is scheduled.
  // A user can have multiple entries — one per (interviewType, role) combo
  // they are open to. These can also be used as defaults when scheduling.
  // -------------------------

  userPreferences: defineTable({
    userId: v.id("users"),
    interviewTypeId: v.id("interviewTypes"),
    role: roleValidator,
  })
    .index("by_user", ["userId"])
    // Lets you query: "all users open to X type as interviewer"
    .index("by_interviewType_and_role", ["interviewTypeId", "role"]),

  // -------------------------
  // Sessions
  // Role and interview type are confirmed at scheduling time.
  // They may match the user's preferences or differ.
  // -------------------------

  sessions: defineTable({
    interviewerId: v.id("users"),
    intervieweeId: v.id("users"),
    topicId: v.id("topics"),
    interviewTypeId: v.id("interviewTypes"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    // Unix ms timestamp — use Date.now() when inserting
    scheduledAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_interviewer", ["interviewerId"])
    .index("by_interviewee", ["intervieweeId"])
    .index("by_status", ["status"])
    .index("by_interviewer_and_status", ["interviewerId", "status"])
    .index("by_interviewee_and_status", ["intervieweeId", "status"]),

});
