// CREATE operations → POST
POST /api/auth/register          // Create account
POST /api/focus-sessions         // Create session
POST /api/tasks                  // Create task

// UPDATE operations → PATCH
PATCH /api/user/profile          // Update profile
PATCH /api/tasks/123             // Update specific task
PATCH /api/settings              // Update settings

// REPLACE operations → PUT
PUT /api/user/profile            // Replace entire profile
PUT /api/tasks/123               // Replace entire task

// READ operations → GET
GET /api/user/profile            // Get profile
GET /api/focus-sessions          // Get all sessions

// DELETE operations → DELETE
DELETE /api/tasks/123            // Delete task
DELETE /api/user/account         // Delete account

// POST typically returns 201 Created
return res.status(201).json({ ... });

// PATCH typically returns 200 OK or 204 No Content
return res.status(200).json({ ... });
// or
return res.status(204).send();  // No content needed