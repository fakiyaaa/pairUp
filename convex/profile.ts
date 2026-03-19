/**
 * convex/profile.ts
 *
 * User profile API.
 *
 * Provides:
 *   - getProfile      → full profile for any user (own or public)
 *   - updateProfile   → patch editable profile fields
 *   - listProfiles    → all public profiles for the browse page
 *
 * Auth note:
 *   Queries accept a `userId` argument so they work independently of the
 *   auth pipeline. Once auth is wired up, replace the `userId` arg with
 *   ctx.auth.getUserIdentity() — no changes to the internal helpers needed.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";

// ---------------------------------------------------------------------------
// Return-type shapes
// (Explicit types make callers predictable and diffs reviewable.)
// ---------------------------------------------------------------------------

type PreferenceSummary = {
  interviewType: string;
  role: "interviewee" | "interviewer" | "both";
};

type UpcomingSession = {
  sessionId: Id<"sessions">;
  status: string;
  scheduledAt: number;
  role: "interviewer" | "interviewee";
  partnerName: string | null;
  topic: string | null;
  interviewType: string | null;
};

type PublicProfile = {
  userId: Id<"users">;
  fullName: string;
  timezone: string;
  experience: string;
  bio: string | null;
  calComLink: string | null;
  preferences: PreferenceSummary[];
};

type FullProfile = PublicProfile & {
  email: string;
  upcomingSessions: UpcomingSession[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// Each helper has one job and returns a typed value.
// ---------------------------------------------------------------------------

/**
 * Resolves a user's preferences into { interviewType, role } summaries.
 * One DB call for the preference rows + one per unique interviewType.
 */
async function resolvePreferences(
  ctx: { db: any },
  userId: Id<"users">
): Promise<PreferenceSummary[]> {
  const prefRows = await ctx.db
    .query("userPreferences")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  if (prefRows.length === 0) return [];

  // Deduplicate interviewType lookups
  const uniqueTypeIds = [...new Set(prefRows.map((r: any) => r.interviewTypeId))];
  const typeMap = new Map(
    await Promise.all(
      uniqueTypeIds.map(async (id: any) => {
        const doc = await ctx.db.get(id);
        return [id, doc?.name ?? null] as const;
      })
    )
  );

  return prefRows.map((r: any) => ({
    interviewType: typeMap.get(r.interviewTypeId) ?? null,
    role: r.role,
  }));
}

/**
 * Resolves upcoming sessions for a user as both interviewer and interviewee.
 * "Upcoming" = scheduled in the future, status is pending or confirmed.
 */
async function resolveUpcomingSessions(
  ctx: { db: any },
  userId: Id<"users">
): Promise<UpcomingSession[]> {
  const now = Date.now();

  const [asInterviewer, asInterviewee] = await Promise.all([
    ctx.db
      .query("sessions")
      .withIndex("by_interviewer_and_status", (q: any) =>
        q.eq("interviewerId", userId)
      )
      .collect(),
    ctx.db
      .query("sessions")
      .withIndex("by_interviewee_and_status", (q: any) =>
        q.eq("intervieweeId", userId)
      )
      .collect(),
  ]);

  const upcoming = [...asInterviewer, ...asInterviewee]
    .filter(
      (s) =>
        s.scheduledAt >= now &&
        s.status !== "cancelled" &&
        s.status !== "completed"
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
        role: isInterviewer ? "interviewer" : "interviewee",
        partnerName: partner?.fullName ?? null,
        topic: topic?.name ?? null,
        interviewType: interviewType?.name ?? null,
      } satisfies UpcomingSession;
    })
  );
}

/**
 * Shapes a raw user doc into the public-facing profile fields.
 * Accepts pre-resolved preferences so callers control when that fetch happens.
 */
function formatPublicProfile(
  user: Doc<"users">,
  preferences: PreferenceSummary[]
): PublicProfile {
  return {
    userId: user._id,
    fullName: user.fullName,
    timezone: user.timezone,
    experience: user.experience,
    bio: user.bio ?? null,
    calComLink: user.calComLink ?? null,
    preferences,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * getProfile
 *
 * Full profile for a given user — used for both "my profile" and public views.
 * Includes email and upcoming sessions (not exposed on listProfiles).
 *
 * Returns null if the user does not exist.
 */
export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }): Promise<FullProfile | null> => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const [preferences, upcomingSessions] = await Promise.all([
      resolvePreferences(ctx, userId),
      resolveUpcomingSessions(ctx, userId),
    ]);

    return {
      ...formatPublicProfile(user, preferences),
      email: user.email,
      upcomingSessions,
    };
  },
});

/**
 * updateProfile
 *
 * Patches editable profile fields. Only fields that are passed get updated.
 * Core identity fields (email, fullName) are intentionally excluded here
 * and should go through a dedicated identity-update flow once auth is live.
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
    if (!user) throw new Error(`User not found: ${userId}`);

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );

    if (Object.keys(patch).length === 0) return userId; // nothing to do

    await ctx.db.patch(userId, patch);
    return userId;
  },
});

/**
 * listProfiles
 *
 * All public-facing profiles for the browse/matching page.
 * Strips email and upcoming sessions — those are only available via getProfile.
 */
export const listProfiles = query({
  handler: async (ctx): Promise<PublicProfile[]> => {
    const users: Doc<"users">[] = await ctx.db.query("users").collect();

    return Promise.all(
      users.map(async (user) => {
        const preferences = await resolvePreferences(ctx, user._id);
        return formatPublicProfile(user, preferences);
      })
    );
  },
});
