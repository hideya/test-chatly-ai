# Simple AI Chat App

An AI chat application providing conversational AI capabilities with user authentication and chat management functionality.
The system implements thread-based conversations with OpenAI integration and responsive UI interactions.
See [docs/FEATURES.md](docs/FEATURES.md) for a detailed list of features.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Building the Application](#building-the-application)
- [Development](#development)
- [Running Unit Tests](#running-unit-tests)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [License](#license)

## Prerequisites

Before running the application, ensure you have:
- Node.js (v18 or later)
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- Access to a PostgreSQL database hosted on [Neon](https://neon.tech) (free account is sufficient)
 
## Installation and Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   ```bash
   cp .env.template .env
   ```

   - Update the `.env` file with your credentials:
     ```env
     # Your Neon PostgreSQL connection URL
     DATABASE_URL=postgresql://user:password@host:port/database

     # Your OpenAI API key
     OPENAI_API_KEY=sk-...
     
     # Server port (optional, defaults to 5001)
     PORT=5001
     ```
     The `DATABASE_URL` is the connection URL to a fresh PostgreSQL database served by Neon.
     The URL can be found in project's Quickstart tab after creation of a new project on Neon.

   - This file is read via the npm scripts defined in [package.json](./package.json)
      instead of `dotenv` for some technical reasons
   - `.gitignore` is configured to ignore this file to prevent accidental commits of the credentials
   - As to the server port, $5001$ is used instead of $5000$, which is used by macOS for AirPlay Receiver

4. Set up the database:
   ```bash
   npm run db:push
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start both the frontend and backend servers on port $5001$.
Hot Module Replacement (HMR) is enabled for both frontend and backend.

## Running Unit Tests

The project uses Vitest for both frontend and backend testing. Tests are organized into separate directories for client and server components.

### Frontend Tests
To run frontend tests:
```bash
npm run test:client
# or run in watch mode
npm run test:client:watch
```

### Backend Tests
To run backend tests:
```bash
npm run test:server
# or run in watch mode
npm run test:server:watch
```

### Test Coverage
To generate test coverage reports:
```bash
npm run test:coverage
```

## Deployment

This application supports deployment on various platforms including Replit, Heroku, AWS, and Docker.
For detailed platform-specific deployment instructions and comprehensive verification steps, please refer to [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Generic deployment steps:

1. Ensure [Prerequisites](#prerequisites)

2. Build for Production:
   ```bash
   npm run build
   ```

3. Start the Application:
   ```bash
   npm start
   ```

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

This project is licensed under the MIT License - see [the LICENSE file](LICENSE) for details.
