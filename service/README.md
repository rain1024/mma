# MMA Service

Express.js REST API service for the MMA tournament application with SQLite database.

## Features

- TypeScript support
- Express.js framework
- SQLite database with better-sqlite3
- CORS enabled
- Environment configuration
- Hot reload in development
- Modular route structure
- Database migrations
- RESTful API design

## Getting Started

### Installation

```bash
yarn install
```

### Environment Setup

Create a `.env` file in the service directory:

```bash
cp .env.example .env
```

Configure the environment variables:
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:3000)

### Database Setup

The database will be automatically initialized when you start the server. To manually run migrations:

```bash
yarn migrate
```

The SQLite database file will be created at `data/mma.db`.

### Development

Start the development server with hot reload:

```bash
yarn dev
```

The server will automatically:
- Run database migrations
- Start on port 4000 (or PORT from .env)
- Watch for file changes and reload

### Production

Build the TypeScript code:

```bash
yarn build
```

Start the production server:

```bash
yarn start
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Athletes
- `GET /api/athletes?tournament=ufc&division=lightweight&gender=male&search=name` - Get all athletes with filters
- `GET /api/athletes/:id` - Get athlete by ID
- `POST /api/athletes` - Create new athlete
- `PUT /api/athletes/:id` - Update athlete
- `DELETE /api/athletes/:id` - Delete athlete

### Events
- `GET /api/events?tournament=ufc` - Get all events
- `GET /api/events/:id` - Get event by ID with matches
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/matches` - Add match to event

### Rankings
- `GET /api/rankings?tournament=ufc` - Get all rankings (P4P + divisions)
- `GET /api/rankings/p4p?tournament=ufc` - Get P4P rankings
- `GET /api/rankings/:division?tournament=ufc` - Get division rankings with champion
- `POST /api/rankings` - Create new division ranking
- `POST /api/rankings/p4p` - Create new P4P ranking

## Project Structure

```
service/
├── src/
│   ├── index.ts           # Application entry point
│   ├── config/
│   │   └── database.ts    # Database connection
│   ├── db/
│   │   ├── schema.sql     # Database schema
│   │   └── migrate.ts     # Migration runner
│   ├── models/            # Database models
│   │   ├── athlete.model.ts
│   │   ├── event.model.ts
│   │   ├── match.model.ts
│   │   └── ranking.model.ts
│   ├── routes/            # API routes
│   │   ├── index.ts       # Route aggregator
│   │   ├── athletes.ts    # Athletes endpoints
│   │   ├── events.ts      # Events endpoints
│   │   └── rankings.ts    # Rankings endpoints
│   └── types/
│       └── index.ts       # TypeScript types
├── data/                  # Database files (generated)
│   └── mma.db
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env
```

## Database Schema

### Tables

- **athletes** - Fighter information (name, division, country, record)
- **events** - Tournament events
- **matches** - Fights within events
- **rankings** - Division rankings with champions
- **p4p_rankings** - Pound-for-pound rankings

See [src/db/schema.sql](src/db/schema.sql) for full schema.

## Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **better-sqlite3** - Fast synchronous SQLite database
- **ts-node-dev** - Development hot reload
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration
