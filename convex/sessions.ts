import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Called by the Cal.com webhook when a booking is confirmed.
// Looks up both users by email and creates a session record.
export const createFromWebhook = internalMutation({
  args: {
    organizerEmail: v.string(),
    attendeeEmail: v.string(),
    scheduledAt: v.number(),
    meetingLink: v.optional(v.string()),
    calBookingUid: v.optional(v.string()),
    interviewTypeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if this booking was already stored
    if (args.calBookingUid) {
      const uid = args.calBookingUid;
      const existing = await ctx.db
        .query("sessions")
        .withIndex("by_cal_booking_uid", (q) => q.eq("calBookingUid", uid))
        .first();
      if (existing) return existing._id;
    }

    const [interviewer, interviewee] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.organizerEmail))
        .first(),
      ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.attendeeEmail))
        .first(),
    ]);

    if (!interviewer || !interviewee) {
      throw new Error(
        `Users not found: organizer=${args.organizerEmail}, attendee=${args.attendeeEmail}`
      );
    }

    let interviewTypeId: Id<"interviewTypes"> | undefined;
    if (args.interviewTypeName) {
      const name = args.interviewTypeName;
      const it = await ctx.db
        .query("interviewTypes")
        .withIndex("by_name", (q) => q.eq("name", name))
        .first();
      if (it) interviewTypeId = it._id;
    }

    return await ctx.db.insert("sessions", {
      interviewerId: interviewer._id,
      intervieweeId: interviewee._id,
      interviewTypeId,
      scheduledAt: args.scheduledAt,
      meetingLink: args.meetingLink,
      calBookingUid: args.calBookingUid,
      status: "confirmed",
    });
  },
});
