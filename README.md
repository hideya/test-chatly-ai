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
- [Project Structure](#project-structure)
- [Running Unit Tests](#running-unit-tests)
- [Deployment](#deployment)
- [Technologies Used](#technologies-used)
- [License](#license)

## Prerequisites

Before running the application, ensure you have:
- Node.js (v18 or later)
- PostgreSQL database
- OpenAI API key

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
## Environment Setup

1. Create your environment configuration:
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

This application supports deployment on various platforms including Replit, Heroku, AWS, and Docker. For detailed platform-specific deployment instructions and comprehensive verification steps, please refer to [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Generic deployment steps:

1. Ensure Prerequisites:
   - Node.js runtime environment
   - PostgreSQL database instance
   - Environment variables configured

2. Build for Production:
   ```bash
   npm run build
   ```

3. Start the Application:
   ```bash
   npm start
   ```

For platform-specific deployment guides, including Replit, Heroku, AWS, and Docker deployments, see [DEPLOYMENT.md](DEPLOYMENT.md).

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
