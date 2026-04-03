import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  
  roles: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  interviewTypes: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  topics: defineTable({
    name: v.string(),
    interviewTypeId: v.id("interviewTypes"),
  }).index("by_name", ["name"]),

  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    timezone: v.string(),
    experience: v.string(),
    bio: v.string(),
    calComLink: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  userInterviewTypes: defineTable({
    userId: v.id("users"),
    interviewTypeId: v.id("interviewTypes"),
  }),

  sessions: defineTable({
    interviewerId: v.id("users"),
    intervieweeId: v.id("users"),
    topicId: v.optional(v.id("topics")),
    interviewTypeId: v.optional(v.id("interviewTypes")),
    status: v.string(),
    scheduledAt: v.number(),
    meetingLink: v.optional(v.string()),
    calBookingUid: v.optional(v.string()),
  })
    .index("by_interviewer", ["interviewerId"])
    .index("by_interviewee", ["intervieweeId"])
    .index("by_schedule_time", ["scheduledAt"])
    .index("by_cal_booking_uid", ["calBookingUid"]),

});