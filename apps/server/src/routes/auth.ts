import express from "express"
const authRouter = express.Router();
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

authRouter.get("/", (req, res) => res.send("Auth API running!"));

authRouter.post("/login",async(req,res)=>{

    const { email, password } = req.body;

    try{
        if (!email || !password) {
            return res.status(400).json({ 
                error: "Email and password are required" 
            });
        }

    // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ 
                error: "Invalid credentials" 
            });
        }

    // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword||"rbbfwrbrfrrrbhrbfbhrbfrbfhrbf");  //dekh le bhai, kebal type error ki vjh s y kiya h, ab jis bhi user k koi password nhi hoga, uska ye hoga

        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: "Invalid credentials" 
            });
        }

    // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

    // Return success response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });


    }
    catch(error){
        console.error("Login error:", error);
        res.status(500).json({ 
            error: "An error occurred during login" 
        });

    }



    

});

authRouter.post("/signup", async (req, res) => {
    const { name, email, password, imagePath } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: "Name, email and password are required" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: "Invalid email format" 
            });
        }

        // Validate password strength (minimum 6 characters)
        if (password.length < 6) {
            return res.status(400).json({ 
                error: "Password must be at least 6 characters long" 
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ 
                error: "User with this email already exists" 
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
                image: imagePath
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        // Return success response (exclude password)
        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                imagePath: newUser.image
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
            error: "An error occurred during signup" 
        });
    }
});

export default authRouter;

// i am adding these comment to make code readable for future refrences