// convex/seed.ts

/**
 * Seed script used to populate the database
 * with initial controlled values.
 *
 * These tables represent enumerated concepts
 * but are implemented as lookup tables so the
 * system can evolve without schema migrations.
 *
 * Seeded tables:
 * - roles
 * - interviewTypes
 * - topics
 * - users
 * - userInterviewTypes  ← populated alongside users
 * - sessions
 */

import { mutation } from "./_generated/server";

export const seedDatabase = mutation(async ({ db }) => {

  /**
   * ROLES
   *
   * Platform roles a user can take during a session.
   *
   * - interviewer: the user conducting the interview
   * - interviewee: the user being interviewed
   *
   * NOTE: "both" is intentionally excluded for now.
   * Users are assigned a single role per session.
   */
  await db.insert("roles", { name: "interviewer" });
  await db.insert("roles", { name: "interviewee" });


  /**
   * INTERVIEW TYPES
   *
   * High-level categories of mock interviews on the platform.
   *
   * - technical: coding, engineering, and CS fundamentals
   * - behavioral: soft skills, culture fit, situational questions
   *
   * NOTE: system design, product sense, case study, and resume review
   * are excluded for now. Can be added in a future seed without
   * requiring a schema migration.
   */
  await db.insert("interviewTypes", { name: "technical" });
  await db.insert("interviewTypes", { name: "behavioral" });


  /**
   * TOPICS
   *
   * Specific focus areas within each interview type.
   * Topics are linked to an interviewType via interviewTypeId.
   *
   * Technical topics:
   * - data structures & algorithms
   * - system design
   * - backend engineering
   * - frontend engineering
   * - statistics
   * - machine learning
   *
   * Behavioral topics:
   * - phone screen
   * - on-site
   * - hiring manager
   *
   * NOTE: topics must be inserted AFTER interviewTypes so that
   * interviewTypeId references are valid at insert time.
   */

  // -- fetch type IDs so topics can reference them correctly --
  const technical = await db
    .query("interviewTypes")
    .withIndex("by_name", (q) => q.eq("name", "technical"))
    .first();

  const behavioral = await db
    .query("interviewTypes")
    .withIndex("by_name", (q) => q.eq("name", "behavioral"))
    .first();

  if (!technical || !behavioral) {
    throw new Error("Interview types must be seeded before topics.");
  }

  // Technical topics
  await db.insert("topics", { name: "data structures & algorithms", interviewTypeId: technical._id });
  await db.insert("topics", { name: "system design",               interviewTypeId: technical._id });
  await db.insert("topics", { name: "backend engineering",         interviewTypeId: technical._id });
  await db.insert("topics", { name: "frontend engineering",        interviewTypeId: technical._id });
  await db.insert("topics", { name: "statistics",                  interviewTypeId: technical._id });
  await db.insert("topics", { name: "machine learning",            interviewTypeId: technical._id });

  // Behavioral topics
  await db.insert("topics", { name: "phone screen",   interviewTypeId: behavioral._id });
  await db.insert("topics", { name: "on-site",        interviewTypeId: behavioral._id });
  await db.insert("topics", { name: "hiring manager", interviewTypeId: behavioral._id });


  /**
   * USERS
   *
   * Mock users representing both interviewers and interviewees.
   * Each user is assigned a role via roleId.
   *
   * NOTE: userInterviewTypes is populated immediately after each
   * user is inserted so the many-to-many relationship stays in sync.
   */

  // -- fetch role IDs --
  const interviewerRole = await db
    .query("roles")
    .withIndex("by_name", (q) => q.eq("name", "interviewer"))
    .first();

  const intervieweeRole = await db
    .query("roles")
    .withIndex("by_name", (q) => q.eq("name", "interviewee"))
    .first();

  if (!interviewerRole || !intervieweeRole) {
    throw new Error("Roles must be seeded before users.");
  }

  // -- fetch topic IDs for session use later --
  const topicDSA = await db
    .query("topics")
    .withIndex("by_name", (q) => q.eq("name", "data structures & algorithms"))
    .first();

  const topicSystemDesign = await db
    .query("topics")
    .withIndex("by_name", (q) => q.eq("name", "system design"))
    .first();

  const topicPhoneScreen = await db
    .query("topics")
    .withIndex("by_name", (q) => q.eq("name", "phone screen"))
    .first();

  if (!topicDSA || !topicSystemDesign || !topicPhoneScreen) {
    throw new Error("Topics must be seeded before sessions.");
  }

  /**
   * User 1 — Alice (interviewer)
   * Practices: technical interviews
   */
  const aliceId = await db.insert("users", {
    fullName: "Alice Johnson",
    email: "alice@example.com",
    passwordHash: "hashed_password_1",
    timezone: "America/New_York",
    experience: "3 years",
    bio: "Senior software engineer with experience in distributed systems.",
    calComLink: "https://cal.com/alice",
    createdAt: Date.now(),
  });

  // populate userInterviewTypes for Alice immediately after inserting her
  await db.insert("userInterviewTypes", {
    userId: aliceId,
    interviewTypeId: technical._id,
  });


  /**
   * User 2 — Bob (interviewee)
   * Practices: technical and behavioral interviews
   */
  const bobId = await db.insert("users", {
    fullName: "Bob Smith",
    email: "bob@example.com",
    passwordHash: "hashed_password_2",
    timezone: "America/Los_Angeles",
    experience: "1 year",
    bio: "Junior developer preparing for FAANG interviews.",
    calComLink: "https://cal.com/bob",
    createdAt: Date.now(),
  });

  // populate userInterviewTypes for Bob immediately after inserting him
  await db.insert("userInterviewTypes", {
    userId: bobId,
    interviewTypeId: technical._id,
  });
  await db.insert("userInterviewTypes", {
    userId: bobId,
    interviewTypeId: behavioral._id,
  });


  /**
   * User 3 — Sara (interviewer)
   * Practices: behavioral interviews
   */
  const saraId = await db.insert("users", {
    fullName: "Sara Lee",
    email: "sara@example.com",
    passwordHash: "hashed_password_3",
    timezone: "Europe/London",
    experience: "5 years",
    bio: "Engineering manager experienced in behavioral and leadership interviews.",
    calComLink: "https://cal.com/sara",
    createdAt: Date.now(),
  });

  // populate userInterviewTypes for Sara immediately after inserting her
  await db.insert("userInterviewTypes", {
    userId: saraId,
    interviewTypeId: behavioral._id,
  });


  /**
   * User 4 — James (interviewee)
   * Practices: technical interviews
   */
  const jamesId = await db.insert("users", {
    fullName: "James Park",
    email: "james@example.com",
    passwordHash: "hashed_password_4",
    timezone: "Asia/Seoul",
    experience: "2 years",
    bio: "Backend engineer preparing for system design rounds.",
    calComLink: "https://cal.com/james",
    createdAt: Date.now(),
  });

  // populate userInterviewTypes for James immediately after inserting him
  await db.insert("userInterviewTypes", {
    userId: jamesId,
    interviewTypeId: technical._id,
  });


  /**
   * SESSIONS
   *
   * Mock interview sessions linking interviewers and interviewees.
   * Each session references:
   * - interviewerId → users
   * - intervieweeId → users
   * - topicId       → topics
   * - interviewTypeId is derivable via topic.interviewTypeId
   *
   * status lifecycle: pending → scheduled → completed | cancelled
   * scheduledAt uses Unix timestamp to avoid timezone bugs.
   */

  // Session 1 — Alice interviews Bob on DSA (technical)
  await db.insert("sessions", {
    interviewerId: aliceId,
    intervieweeId: bobId,
    topicId: topicDSA._id,
    interviewTypeId: technical._id,
    status: "scheduled",
    scheduledAt: Date.now() + 1000 * 60 * 60 * 24,     // 1 day from now
  });

  // Session 2 — Sara interviews Bob on Phone Screen (behavioral)
  await db.insert("sessions", {
    interviewerId: saraId,
    intervieweeId: bobId,
    topicId: topicPhoneScreen._id,
    interviewTypeId: behavioral._id,
    status: "pending",
    scheduledAt: Date.now() + 1000 * 60 * 60 * 48,     // 2 days from now
  });

  // Session 3 — Alice interviews James on System Design (technical)
  await db.insert("sessions", {
    interviewerId: aliceId,
    intervieweeId: jamesId,
    topicId: topicSystemDesign._id,
    interviewTypeId: technical._id,
    status: "completed",
    scheduledAt: Date.now() - 1000 * 60 * 60 * 24,     // 1 day ago
  });

});