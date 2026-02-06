import type { Request, Response } from "express";
import { getUserTags, createUserTag } from "./tags.service.js";

export async function getTagsController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const tags = await getUserTags(userId);

    return res.status(200).json({
      success: true,
      message: "Here are your tags",
      tags,
    });
  } catch (err) {
    console.error("Get tags error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
    });
  }
}

export async function createTagController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { tag } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!tag || typeof tag !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid tag",
      });
    }

    const createdTag = await createUserTag(userId, tag);

    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      tag: createdTag,
    });
  } catch (err: any) {
    if (err?.code === "TAG_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Tag already exists",
      });
    }

    console.error("Create tag error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create tag",
    });
  }
}
