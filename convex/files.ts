import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }
  return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(ctx: MutationCtx | QueryCtx, orgId: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();
  if (!user) {
    return null;
  }
  const hasAccess =
    user.orgIds.some((i) => i.orgId.includes(orgId)) ||
    user.tokenIdentifier.includes(orgId);
  if (!hasAccess) return null;
  return { user };
}

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    type: fileTypes,
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this org!");
    }
    const fileUrl = await ctx.storage.getUrl(args.fileId);
    await ctx.db.insert("files", {
      name: args.name,
      fileId: args.fileId,
      type: args.type,
      orgId: args.orgId,
      url: fileUrl,
      shouldDelete: false,
      userId: hasAccess.user._id,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    type: v.optional(fileTypes),
    favoritesOnly: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      return [];
    }
    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    if (args.type) {
      files = files.filter((file) => file.type == args.type);
    }
    if (args.deletedOnly) {
      return files.filter((file) => file.shouldDelete);
    }
    if (!args.favoritesOnly) {
      return files.filter((file) => !file.shouldDelete);
    }
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
      )
      .collect();
    const res = files.filter(
      (file) =>
        favorites.some((favorite) => favorite.fileId === file.fileId) &&
        !file.shouldDelete
    );
    return res;
  },
});

export const deleteAllFiles = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
      .collect();

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      })
    );
  },
});
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const access = await hasAccessToFile(ctx, args.fileId);
    if (!access) {
      throw new ConvexError("You do not have access to this org!");
    }
    const isAdmin = access.user.orgIds.some(
      (org) => org.orgId === access.file.orgId && org.role === "admin"
    );
    if (!isAdmin) {
      throw new ConvexError("You do not have admin access to this org!");
    }
    await ctx.db.patch(args.fileId, { shouldDelete: true });
  },
});

export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const access = await hasAccessToFile(ctx, args.fileId);
    if (!access) {
      throw new ConvexError("You do not have access to this org!");
    }
    const isAdmin = access.user.orgIds.some(
      (org) => org.orgId === access.file.orgId && org.role === "admin"
    );
    if (!isAdmin) {
      throw new ConvexError("You do not have admin access to this org!");
    }
    await ctx.db.patch(args.fileId, { shouldDelete: false });
  },
});

export const toggleFavorite = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const access = await hasAccessToFile(ctx, args.fileId);
    if (!access) {
      throw new ConvexError("no access to file");
    }
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file.fileId)
      )
      .first();
    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: access.file.fileId,
        userId: access.user._id,
        orgId: access.file.orgId,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});

export const getAllFavorites = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const access = await hasAccessToOrg(ctx, args.orgId);
    if (!access) {
      return [];
    }
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", access.user._id).eq("orgId", args.orgId)
      )
      .collect();
    return favorites;
  },
});

async function hasAccessToFile(
  ctx: MutationCtx | QueryCtx,
  fileId: Id<"files">
) {
  const file = await ctx.db.get(fileId);
  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId);
  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}
