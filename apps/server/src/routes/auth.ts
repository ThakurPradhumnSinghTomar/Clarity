import express from "express";
const authRouter = express.Router();
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  loginSchema,
  signupSchema,
  oauthUserSchema,
} from "../modules/auth/auth.schema.js";

authRouter.get("/", (req, res) => res.send("Auth API running!"));

authRouter.post("/login", validateRequest(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashedPassword || "rbbfwrbrfrrrbhrbfbhrbfrbfhrbf",
    ); //dekh le bhai, kebal type error ki vjh s y kiya h, ab jis bhi user k koi password nhi hoga, uska ye hoga😂

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    // Return success response
    const responseData = {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    };

    console.log("  - Login response:", JSON.stringify(responseData, null, 2));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "An error occurred during login",
    });
  }
});

authRouter.post("/signup", validateRequest(signupSchema), async (req, res) => {
  const { name, email, password, imagePath } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword: hashedPassword,
        image: imagePath,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, imagePath: imagePath },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    // Return success response (exclude password)
    const responseData = {
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image, // ✅ Make sure this is image, not imagePath
      },
    };

    // 🔍 DEBUG: Check response being sent
    console.log(
      "  - Response being sent:",
      JSON.stringify(responseData, null, 2),
    );

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: error,
    });
  }
});

authRouter.post(
  "/oauth-user",
  validateRequest(oauthUserSchema),
  async (req, res) => {
    try {
      const { email, name, image, provider, providerId } = req.body;

      // Validate required fields
      if (!email || !provider || !providerId) {
        return res.status(400).json({
          error:
            "Missing required fields: email, provider, and providerId are required",
        });
      }

      // Check if user already exists by email
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Generate JWT token for existing user
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            name: user.name,
            imagePath: image,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "30d" },
        );

        return res.status(200).json({
          success: true,
          token, // JWT token
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
          message: "User updated successfully",
        });
      }

      // User doesn't exist - create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0], // Use email prefix if no name provided
          image,
          provider,
          providerId,
          emailVerified: new Date(), // OAuth users have verified emails
        },
      });

      // Generate JWT token for new user
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          imagePath: image,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" },
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
        message: "User created successfully",
      });
    } catch (error: any) {
      console.error("OAuth user handler error:", error);

      // Handle unique constraint violations (duplicate emails)
      if (error.code === "P2002") {
        return res.status(409).json({
          error: "User with this email already exists",
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

export default authRouter;
