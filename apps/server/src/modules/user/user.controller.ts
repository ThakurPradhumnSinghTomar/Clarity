import type { Request, Response } from "express";
import { getUserProfile, updateUserProfile } from "./user.service.js";

import { updateUserPing, updateUserFocusing } from "./user.service.js";

export async function getCurrentUserProfileController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      response: user,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
}

export async function updateUserProfileController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, image } = req.body;

    if (!name && !image) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const updatedUser = await updateUserProfile(userId, {
      ...(name && { name }),
      ...(image && { image }),
    });

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

export async function pingUserController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await updateUserPing(userId);

    return res.status(200).json({
      success: true,
      message: "Ping updated",
    });
  } catch (error) {
    console.error("Ping error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update ping",
    });
  }
}

export async function updateFocusingController(req: Request, res: Response) {
  try {
    
    const { isFocusing, userId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (typeof isFocusing !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFocusing must be a boolean",
      });
    }

    await updateUserFocusing(userId, isFocusing);

    return res.status(200).json({
      success: true,
      isFocusing,
    });
  } catch (error) {
    console.error("Update focusing error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
