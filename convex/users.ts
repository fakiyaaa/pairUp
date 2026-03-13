import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("interviewer"),
      v.literal("interviewee"),
      v.literal("both"),
    ),
    timezone: v.string(),
    interviewTypes: v.array(
      v.union(
        v.literal("technical"),
        v.literal("behavioral"),
        v.literal("case"),
        v.literal("product"),
      ),
    ),
    topics: v.array(v.string()),
    experience: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    schedulingUrl: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});
