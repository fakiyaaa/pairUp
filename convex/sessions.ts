// convex/schema.ts

/**
 * Base database schema for the mock interview platform.
 *
 * This schema is intentionally normalized so that:
 * - roles, topics, and interview types are controlled vocabularies
 * - users can select multiple roles and topics
 * - sessions connect two users together
 *
 * The schema is designed to support:
 * - authentication
 * - onboarding (roles, topics)
 * - scheduling mock interviews
 * - querying upcoming sessions
 * - matching users by topic
 * *NOTE: Convex automatically generate id for every table and new added row. This is why we didn't add id field in the schemas
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  /**
   * USERS
   *
   * Stores profile information.
   * Authentication is handled by Convex built-in auth — no passwordHash needed.
   *
   * Important notes:
   * - timezone is needed to properly render scheduled interviews
   * - calComLink is required at signup for scheduling
   */
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    timezone: v.string(),
    experience: v.string(),
    bio: v.string(),
    calComLink: v.string(),

    createdAt: v.number(), // unix timestamp
  }),



  /**
   * ROLES
   *
   * Controlled vocabulary table.
   *
   * Users can be:
   * - interviewer
   * - interviewee
   *
   * Stored as a table rather than an enum so the system
   * can expand in the future without changing the schema.
   */
  roles: defineTable({
    name: v.string(),
  }),


  /**
   * USER ROLES
   *
   * Join table linking users to roles.
   *
   * Many-to-many relationship:
   * A user may have multiple roles.
   */
  userRoles: defineTable({
    userId: v.id("users"),
    roleId: v.id("roles"),
  })
    .index("by_user", ["userId"]),


  /**
   * INTERVIEW TYPES
   *
   * Defines categories of interviews on the platform.
   *
   * Typical industry categories:
   * - technical
   * - behavioral
   */
  interviewTypes: defineTable({
    name: v.string(),
  }),

  /**
   * USER INTERVIEW TYPES
   *
   * Join table linking users to interview types.
   *
   * Many-to-many relationship:
   * A user may practice multiple interview types.
   */
  userInterviewTypes: defineTable({
    userId: v.id("users"),
    interviewTypeId: v.id("interviewTypes"),
  })
    .index("by_user", ["userId"]),

  /**
   * TOPICS
   *
   * Topics represent areas users want to practice interviews in,
   * grouped under an interview type.
   *
   * Examples:
   * - system design (technical)
   * - data structures & algorithms (technical)
   * - behavioral questions (behavioral)
   */
  topics: defineTable({
    name: v.string(),
    interviewTypeId: v.id("interviewTypes"),
  }),


  /**
   * SESSIONS
   *
   * Core interaction table connecting two users.
   *
   * Represents a scheduled mock interview.
   *
   * Relationships:
   * - interviewerId → users
   * - intervieweeId → users
   * - topicId → topics (interview type is derivable via topic.interviewTypeId)
   *
   * status is stored as string because states may evolve:
   * - pending
   * - scheduled
   * - completed
   * - cancelled -> rescheduled and cancelled sessions are considered cancelled.
   *
   * scheduledAt uses a UNIX timestamp to avoid timezone bugs.
   */
  sessions: defineTable({

    interviewerId: v.id("users"),
    intervieweeId: v.id("users"),

    topicId: v.id("topics"),

    status: v.string(),

    scheduledAt: v.number(),

    createdAt: v.number(),
  })

    // Used when showing upcoming interviews for interviewer
    .index("by_interviewer", ["interviewerId"])

    // Used when showing upcoming interviews for interviewee
    .index("by_interviewee", ["intervieweeId"])

    // Used when filtering sessions by time
    .index("by_schedule_time", ["scheduledAt"]),
});
