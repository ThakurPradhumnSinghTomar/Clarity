import type { Request, Response } from "express";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPing,
  updateUserFocusing,
  saveUserFcmToken,
} from "./user.service.js";

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


// Controller to save a user's Firebase Cloud Messaging (FCM) token
// This token represents a specific device where push notifications
// can be delivered (phone, browser, tablet, etc.)
export async function saveFcmTokenController(req: Request, res: Response) {
  try {

    // Get the authenticated user's ID from the request
    // req.user is usually added by an authentication middleware
    const userId = req.user?.id;

    // If the request is not authenticated, reject it
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }


    // Extract the FCM token sent from the client (frontend)
    // The frontend usually sends this token after registering
    // with Firebase Messaging
    const { token } = req.body;


    // Validate the token
    // Ensure it exists and is a string
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid Firebase token is required",
      });
    }


    // Fetch the user profile from the database
    // This likely includes the stored FCM tokens for that user
    const existingUser = await getUserProfile(userId);


    // If the user doesn't exist in the database
    // return a 404 error
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // Check if this FCM token already exists for the user
    // This prevents duplicate tokens being stored
    if (existingUser.fcmTokens?.includes(token)) {
      return res.status(200).json({
        success: true,
        message: "Token already registered",
      });
    }


    // Save the new token for the user
    // Usually this means pushing the token into
    // an array field in the database
    await saveUserFcmToken(userId, token);


    // Return success response
    return res.status(200).json({
      success: true,
      message: "FCM token saved",
    });


  } catch (error) {

    // If any unexpected error occurs during execution
    // log it to the server console
    console.error("Save FCM token error:", error);


    // Return a generic internal server error response
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
