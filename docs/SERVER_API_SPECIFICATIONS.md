# Server API specifications

## Authentication Endpoints

Authentication endpoints manage sessions via cookies.
The app uses `express-session` with a cookie-based session store
and the session cookie is automatically managed by Express and Passport.js.
All authenticated API requests must include this cookie to maintain the session.

**POST /api/auth/login**

- Request body: `{ username: string, password: string }`
- Response: `{ message: string, user: { id: number, username: string } }`
- Errors: `401` if invalid credentials

**POST /api/auth/register**

- Request body: `{ username: string, password: string }`
- Response: `{ message: string, user: { id: number, username: string } }`
- Errors: `400` if username exists

**POST /api/auth/logout**

- Response: `{ message: string }`
- Errors: `500` if logout fails

**GET /api/auth/user**

- Response: User object if authenticated
- Errors: `401` if not logged in

## Chat Endpoints

**GET /api/threads**

- Description: Get all chat threads for authenticated user
- Response: Array of thread objects
- Errors: `401` if not authenticated, `500` if fetch fails

**GET /api/threads/:threadId/messages**

- Description: Get messages for a specific thread
- Response: Array of message objects ordered by creation time
- Errors: `401` if not authenticated, `500` if fetch fails

**POST /api/threads**

- Description: Create new chat thread
- Request body: `{ message: string }`
- Response: `{ thread: ThreadObject, messages: MessageObject[] }`
- Errors: `401` if not authenticated, `400` if message missing

**POST /api/threads/:threadId/messages**

- Description: Add message to existing thread
- Request body: `{ message: string }`
- Response: Array of two messages (user message and AI response)
- Errors: `401` if not authenticated, `400` if message missing

**DELETE /api/threads/:threadId**

- Description: Delete thread and its messages
- Response: `{ success: true }`
- Errors: `401` if not authenticated, `500` if deletion fails

## System Endpoints

**GET /health**

- Description: Health check endpoint
- Response: `{ status: string, timestamp: string, version: string }`
