import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Middleware factory function that creates an Express middleware for request validation
 * @param schema - A Zod schema that defines the validation rules for the request
 * @returns Express middleware function that validates incoming requests
 */
export const validateRequest =
  (schema: z.ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Parse the request data (body, params, query) against the provided Zod schema
    // safeParse returns { success: true, data: T } on success or { success: false, error: ZodError } on failure
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
    });

    // Check if validation failed
    if (!result.success) {
      // Return a 400 Bad Request response with validation errors
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        // flatten() converts the ZodError into a more readable format
        errors: result.error.flatten(),
      });
    }

    // Type assertion to tell TypeScript that result.data has the expected structure
    // This is safe because we've already checked result.success is true
    const validatedData = result.data as {
      body?: typeof req.body;
      params?: typeof req.params;
      query?: typeof req.query;
    };

    // Replace req.body with validated data if it exists, otherwise keep original
    req.body = validatedData.body ?? req.body;
    
    // Replace req.params with validated data if it exists, otherwise keep original
    req.params = validatedData.params ?? req.params;
    

    // Call next() to pass control to the next middleware in the chain
    next();
  };