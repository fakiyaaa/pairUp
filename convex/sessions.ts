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
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  /**
   * USERS
   *
   * Stores authentication and profile information.
   *
   * Important notes:
   * - email must be unique (login lookup)
   * - passwordHash is stored instead of plaintext password
   * - timezone is needed to properly render scheduled interviews
   */
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    timezone: v.string(),

    createdAt: v.number(), // unix timestamp
  })
    // login queries must be fast
    .index("by_email", ["email"]),


  /**
   * ROLES
   *
   * Controlled vocabulary table.
   *
   * Users can be:
   * - interviewer
   * - interviewee
   * - both
   *
   * Stored as a table rather than an enum so the system
   * can expand in the future without changing the schema.
   */
  roles: defineTable({
    name: v.string(),
  })
    .index("by_name", ["name"]),


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
   * TOPICS
   *
   * Topics represent areas users want to practice interviews in.
   *
   * Examples:
   * - system design
   * - data structures & algorithms
   * - product management
   */
  topics: defineTable({
    name: v.string(),
  })
    .index("by_name", ["name"]),


  /**
   * USER TOPICS
   *
   * Many-to-many relationship between users and topics.
   *
   * Allows users to select multiple practice areas.
   */
  userTopics: defineTable({
    userId: v.id("users"),
    topicId: v.id("topics"),
  })
    .index("by_user", ["userId"])
    .index("by_topic", ["topicId"]),



  /**
   * INTERVIEW TYPES
   *
   * Defines categories of interviews on the platform.
   *
   * Typical industry categories:
   * - technical
   * - behavioral
   * - system design
   * - product sense
   * - case study
   */
  interviewTypes: defineTable({
    name: v.string(),
  })
    .index("by_name", ["name"]),



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
   * - topicId → topics
   * - interviewTypeId → interviewTypes
   *
   * status is stored as string because states may evolve:
   * - pending
   * - scheduled
   * - completed
   * - cancelled
   *
   * scheduledAt uses a UNIX timestamp to avoid timezone bugs.
   */
  sessions: defineTable({

    interviewerId: v.id("users"),
    intervieweeId: v.id("users"),

    topicId: v.id("topics"),
    interviewTypeId: v.id("interviewTypes"),

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