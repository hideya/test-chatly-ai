# Cimple AI Chat App

A full-featured ChatGPT-like application providing conversational AI capabilities with user authentication and chat management functionality. The system implements thread-based conversations with OpenAI integration and responsive UI interactions.

## Features

- **User Authentication**
  - Secure login and registration system
  - Session-based authentication
  - Protected routes and API endpoints

- **Chat Management**
  - Thread-based conversation organization
  - Real-time chat interface
  - Chat history with timestamps
  - Delete conversation functionality

- **OpenAI Integration**
  - Direct integration with OpenAI's API
  - Intelligent response generation
  - Support for context-aware conversations

- **Advanced UI Features**
  - Responsive design with Tailwind CSS
  - LaTeX rendering for mathematical expressions
  - Interactive button animations
  - Real-time loading states
  - Toast notifications for feedback
  - Resizable chat panels

## Technologies Used

- **Frontend**
  - React with TypeScript
  - Tailwind CSS for styling
  - Shadcn UI components
  - React Query for state management
  - KaTeX for LaTeX rendering
  - Lucide React for icons
  - Wouter for routing

- **Backend**
  - Node.js with Express
  - PostgreSQL database
  - Drizzle ORM
  - OpenAI API integration

## Prerequisites

Before running the application, ensure you have:
- Node.js (v18 or later)
- PostgreSQL database
- OpenAI API key

## Environment Variables

The following environment variables are required:

```env
DATABASE_URL=postgresql://...  # PostgreSQL connection URL
OPENAI_API_KEY=sk-...         # Your OpenAI API key
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chatgpt-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:push
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start both the frontend and backend servers on port 5000.

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript type definitions
├── server/               # Backend Express server
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication logic
│   └── openai.ts        # OpenAI integration
└── db/                  # Database schemas and migrations
```

## Features in Detail

### Authentication System
- Secure user registration and login
- Password hashing and session management
- Protected routes with authentication checks

### Chat Interface
- Real-time message updates
- Thread-based conversation management
- Markdown and LaTeX support
- Loading states and animations
- Responsive design for all screen sizes

### OpenAI Integration
- Direct communication with OpenAI's API
- Context-aware conversation handling
- Proper error handling and rate limiting
- Support for various response types



## License

This project is licensed under the MIT License - see the LICENSE file for details.
