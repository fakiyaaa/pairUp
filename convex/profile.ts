/**
 * convex/profile.ts
 *
 * User profile API.
 *
 * Provides:
 *   - getProfile      → full profile for any user (own or public)
 *   - listProfiles    → all public profiles for the browse page
 *
 * Auth note:
 *   Queries accept a `userId` argument so they work independently of the
 *   auth pipeline. Once auth is wired up, a thin authenticated wrapper can
 *   be added here using ctx.auth.getUserIdentity() — no changes to these
 *   queries needed.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fetches upcoming sessions for a user (as interviewer or interviewee).
 * "Upcoming" = not cancelled, not completed, scheduledAt >= now.
 */
async function getUpcomingSessions(ctx: { db: any }, userId: Id<"users">) {
  const now = Date.now();

  const [asInterviewer, asInterviewee] = await Promise.all([
    ctx.db
      .query("sessions")
      .withIndex("by_interviewer", (q: any) => q.eq("interviewerId", userId))
      .collect(),
    ctx.db
      .query("sessions")
      .withIndex("by_interviewee", (q: any) => q.eq("intervieweeId", userId))
      .collect(),
  ]);

  const upcoming: any[] = [...asInterviewer, ...asInterviewee]
    .filter(
      (s) =>
        s.status !== "cancelled" &&
        s.status !== "completed" &&
        s.scheduledAt >= now
    )
    .sort((a, b) => a.scheduledAt - b.scheduledAt);

  return Promise.all(
    upcoming.map(async (s) => {
      const isInterviewer = s.interviewerId === userId;
      const partnerId: Id<"users"> = isInterviewer
        ? s.intervieweeId
        : s.interviewerId;

      const [partner, topic, interviewType] = await Promise.all([
        ctx.db.get(partnerId),
        ctx.db.get(s.topicId),
        ctx.db.get(s.interviewTypeId),
      ]);

      return {
        sessionId: s._id,
        status: s.status,
        scheduledAt: s.scheduledAt,
        isInterviewer,
        partnerName: partner?.fullName ?? null,
        topic: topic?.name ?? null,
        interviewType: interviewType?.name ?? null,
      };
    })
  );
}

/**
 * Fetches onboarding selections for a user:
 * roles (from userRoles), topics (from userTopics),
 * and interview types (from userInterviewTypes).
 *
 * Topics include their parent interviewType name because
 * topics.interviewTypeId links each topic to a category.
 */
async function getOnboardingInfo(ctx: { db: any }, userId: Id<"users">) {
  const [roleRows, topicRows, interviewTypeRows] = await Promise.all([
    ctx.db
      .query("userRoles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("userTopics")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("userInterviewTypes")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect(),
  ]);

  const [roles, topics, interviewTypes] = await Promise.all([
    Promise.all(
      roleRows.map(async (r: any) => {
        const role = await ctx.db.get(r.roleId);
        return role?.name ?? null;
      })
    ),
    Promise.all(
      topicRows.map(async (r: any) => {
        const topic = await ctx.db.get(r.topicId);
        if (!topic) return null;
        const interviewType = await ctx.db.get(topic.interviewTypeId);
        return {
          name: topic.name,
          interviewType: interviewType?.name ?? null,
        };
      })
    ),
    Promise.all(
      interviewTypeRows.map(async (r: any) => {
        const it = await ctx.db.get(r.interviewTypeId);
        return it?.name ?? null;
      })
    ),
  ]);

  return {
    roles: roles.filter(Boolean) as string[],
    topics: topics.filter(Boolean) as { name: string; interviewType: string | null }[],
    interviewTypes: interviewTypes.filter(Boolean) as string[],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * getProfile
 *
 * Full profile for a given user — used for both the authenticated
 * "my profile" page and public profile views linked from browse.
 *
 * Returns null if the user does not exist.
 */
export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const [onboarding, upcomingSessions] = await Promise.all([
      getOnboardingInfo(ctx, userId),
      getUpcomingSessions(ctx, userId),
    ]);

    return {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      timezone: user.timezone,
      bio: user.bio,
      experience: user.experience,
      calComLink: user.calComLink,
      createdAt: user.createdAt,
      onboarding,
      upcomingSessions,
    };
  },
});

/**
 * updateProfile
 *
 * Updates editable profile fields for a given user.
 * Auth-owned fields (email, passwordHash, fullName, createdAt) are excluded.
 *
 * Once the auth pipeline is complete, replace the `userId` arg with
 * ctx.auth.getUserIdentity() to lock this down to the current user.
 *
 * Returns the updated userId on success.
 */
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    bio: v.optional(v.string()),
    experience: v.optional(v.string()),
    calComLink: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...fields }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Only apply fields that were actually passed
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(userId, patch);
    return userId;
  },
});

/**
 * listProfiles
 *
 * All user profiles for the browse page.
 * Strips email — callers get only public-facing fields.
 */
export const listProfiles = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    return Promise.all(
      users.map(async (user: any) => {
        const onboarding = await getOnboardingInfo(ctx, user._id);

        return {
          userId: user._id,
          fullName: user.fullName,
          timezone: user.timezone,
          bio: user.bio,
          experience: user.experience,
          calComLink: user.calComLink,
          onboarding,
        };
      })
    );
  },
});
