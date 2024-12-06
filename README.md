# Simple AI Chat App

An AI chat application providing conversational AI capabilities with user authentication and chat management functionality.
The system implements thread-based conversations with OpenAI integration and responsive UI interactions.

## Prerequisites

Before running the application, ensure you have:
- Node.js (v18 or later)
- PostgreSQL database
- OpenAI API key

## Environment Setup

1. Create your environment configuration:
   - Copy the template environment file:
     ```bash
     cp .env.template .env
     ```
   - The `.env` file is automatically ignored by Git to prevent accidental commits
   - Update the `.env` file with your credentials:
     - Set your PostgreSQL database URL
     - Add your OpenAI API key

2. Required environment variables:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database  # Your PostgreSQL connection URL (default port: 5432)
   OPENAI_API_KEY=sk-...         # Your OpenAI API key
   PORT=5000                     # Server port (optional, defaults to 5000)
   ```

Important:
- Never commit the `.env` file to version control
- Always use `.env.template` as a reference for required variables
- Keep your API keys and sensitive credentials secure

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:push
   ```

## Building the Application

After installation, build the application:

```bash
npm run build
```

This command will:
- Build the frontend React application
- Compile the backend TypeScript code
- Prepare the application for production deployment

The build artifacts will be created in the `dist` directory.

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

## Features

### User Authentication & Security
- **Secure Authentication Flow**
  - Robust login and registration system
  - Session-based authentication with secure token management
  - Password hashing and salting for enhanced security
  - Protected API endpoints and route guards

### Chat System & Conversation Management
- **Thread-based Organization**
  - Hierarchical conversation structure with separate chat threads
  - Persistent chat history with timestamps
  - Easy thread management (create, switch, delete)
  - Real-time message synchronization

- **Intelligent Messaging**
  - Context-aware conversation handling
  - Support for rich text formatting and Markdown
  - LaTeX rendering for mathematical expressions
  - Message history preservation and retrieval

### OpenAI Integration
- **Advanced AI Capabilities**
  - Seamless integration with OpenAI's API
  - Intelligent response generation with context awareness
  - Support for various response types and formats
  - Built-in rate limiting and error handling
  - Optimized prompt management for better responses

### User Interface & Experience
- **Modern, Responsive Design**
  - Clean, intuitive interface built with Tailwind CSS
  - Fully responsive layout for all screen sizes
  - Dark/light mode support
  - Resizable chat panels for customized workspace

- **Interactive Elements**
  - Real-time loading states and progress indicators
  - Smooth animations and transitions
  - Interactive button feedback
  - Toast notifications for system feedback
  - Drag-and-drop file support

### Performance & Reliability
- **Optimized Performance**
  - Efficient state management with React Query
  - Lazy loading of chat history
  - Optimized API calls and caching
  - Responsive even with large conversation threads

- **Error Handling & Recovery**
  - Graceful error handling and display
  - Automatic reconnection attempts
  - Session persistence across page reloads
  - Data loss prevention mechanisms

## Technologies Used

- **Frontend**
  - [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) for styling
  - [Shadcn UI](https://ui.shadcn.com/) components
  - [TanStack Query](https://tanstack.com/query/latest) for state management
  - [KaTeX](https://katex.org/) for LaTeX rendering
  - [Lucide React](https://lucide.dev/guide/packages/lucide-react) for icons
  - [Wouter](https://github.com/molefrog/wouter) for routing

- **Backend**
  - [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
  - [PostgreSQL](https://www.postgresql.org/) database
  - [Drizzle ORM](https://orm.drizzle.team/) for database management
  - [OpenAI API](https://platform.openai.com/docs/introduction) integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.
