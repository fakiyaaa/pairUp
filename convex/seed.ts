// convex/seed.ts

/**
 * Seed script used to populate the database
 * with initial controlled values.
 *
 * These tables represent enumerated concepts
 * but are implemented as lookup tables so the
 * system can evolve without schema migrations.
 */

import { mutation } from "./_generated/server";

export const seedDatabase = mutation(async ({ db }) => {

  /**
   * ROLES
   *
   * Platform roles for users.
   */
  await db.insert("roles", { name: "interviewer" });
  await db.insert("roles", { name: "interviewee" });
  await db.insert("roles", { name: "both" });



  /**
   * INTERVIEW TYPES
   *
   * Common mock interview formats used across platforms.
   */
  await db.insert("interviewTypes", { name: "technical" });
  await db.insert("interviewTypes", { name: "behavioral" });
  await db.insert("interviewTypes", { name: "system design" });
  await db.insert("interviewTypes", { name: "product sense" });
  await db.insert("interviewTypes", { name: "case study" });
  await db.insert("interviewTypes", { name: "resume review" });



  /**
   * TOPICS
   *
   * Interview preparation domains.
   */
  await db.insert("topics", { name: "data structures & algorithms" });
  await db.insert("topics", { name: "system design" });
  await db.insert("topics", { name: "backend engineering" });
  await db.insert("topics", { name: "frontend engineering" });
  await db.insert("topics", { name: "distributed systems" });
  await db.insert("topics", { name: "product management" });
  await db.insert("topics", { name: "machine learning" });

});