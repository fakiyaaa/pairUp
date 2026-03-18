import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const create = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    timezone: v.string(),
    experience: v.string(),
    bio: v.string(),
    calComLink: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});