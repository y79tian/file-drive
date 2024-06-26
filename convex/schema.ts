import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(
  v.literal("image"),
  v.literal("csv"),
  v.literal("pdf")
);
export const roles = v.union(v.literal("admin"), v.literal("member"));
export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: fileTypes,
    fileId: v.id("_storage"),
    orgId: v.string(),
    userId: v.id("users"),
    url: v.union(v.string(), v.null()),
    shouldDelete: v.boolean(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_shouldDelete", ["shouldDelete"]),
  favorites: defineTable({
    fileId: v.string(),
    orgId: v.string(),
    userId: v.id("users"),
  }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.object({ orgId: v.string(), role: roles })),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
