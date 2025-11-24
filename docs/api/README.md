# MMA Tournament API Documentation

This directory contains the OpenAPI v3.1 specification for the MMA Tournament API.

## Files

- `openapi.yaml` - Complete OpenAPI 3.1 specification for all API endpoints

## Viewing the Documentation

### Option 1: Swagger UI

You can view the API documentation using Swagger UI:

1. Visit [Swagger Editor](https://editor.swagger.io/)
2. Click **File** → **Import file**
3. Select `openapi.yaml`

### Option 2: Redoc

For a more modern documentation view:

1. Visit [Redoc Online](https://redocly.github.io/redoc/)
2. Paste the URL to your `openapi.yaml` or upload the file

### Option 3: Local Swagger UI with Docker

Run Swagger UI locally:

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/docs/openapi.yaml \
  -v $(pwd)/docs/api:/docs \
  swaggerapi/swagger-ui
```

Then visit http://localhost:8080

### Option 4: VSCode Extension

Install the [OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) extension and open `openapi.yaml`.

## API Overview

### Base URL

- **Development**: http://localhost:4000

### Endpoints

#### Health
- `GET /health` - Health check

#### Athletes
- `GET /api/athletes` - Get all athletes (with filters)
- `GET /api/athletes/{id}` - Get athlete by ID
- `POST /api/athletes` - Create new athlete
- `PUT /api/athletes/{id}` - Update athlete
- `DELETE /api/athletes/{id}` - Delete athlete

#### Events
- `GET /api/events` - Get all events
- `GET /api/events/{id}` - Get event with matches
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `POST /api/events/{id}/matches` - Add match to event

#### Rankings
- `GET /api/rankings` - Get all rankings (P4P + divisions)
- `GET /api/rankings/p4p` - Get P4P rankings only
- `GET /api/rankings/{division}` - Get division rankings
- `POST /api/rankings` - Create division ranking
- `POST /api/rankings/p4p` - Create P4P ranking

### Query Parameters

Most endpoints support a `tournament` query parameter:
- `ufc` (default)
- `lion`

Athletes endpoint supports additional filters:
- `division` - Filter by weight division
- `gender` - Filter by gender (male/female)
- `search` - Search by name

## Example Requests

### Get all UFC athletes
```bash
curl http://localhost:4000/api/athletes?tournament=ufc
```

### Get lightweight division rankings
```bash
curl http://localhost:4000/api/rankings/lightweight?tournament=ufc
```

### Create a new athlete
```bash
curl -X POST http://localhost:4000/api/athletes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "tournament": "ufc",
    "division": "welterweight",
    "country": "USA",
    "wins": 15,
    "losses": 3,
    "draws": 0
  }'
```

### Get event with matches
```bash
curl http://localhost:4000/api/events/ufc-300
```

## Schema Validation

The OpenAPI specification includes complete schema definitions for all data types:
- `Athlete` / `AthleteInput`
- `Event` / `EventInput`
- `Match` / `MatchInput`
- `Ranking` / `RankingInput`
- `P4PRanking` / `P4PRankingInput`

Use these schemas to validate request/response payloads in your client applications.

## Integration

You can generate client SDKs from this OpenAPI spec using tools like:
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)

Example:
```bash
# Generate TypeScript client
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o client/
```
