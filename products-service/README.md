# Products Service (NestJS + Sequelize + MySQL)

Backend microservice for managing e-commerce products using NestJS and Sequelize.

## Notes & Suggestions

- All database fields and validation limits are just examples.
  In a real-world scenario, these should be derived from the domain.

- Price is implemented as decimal as it was defined in the requirements document.
  It is suggested to represent price as an integer (in cents) to avoid possible rounding issues.

- Product updates currently only support changing stock, as requested in the requirements document.
  In practice, separate methods to update product name and price are needed as well.

- It is suggested to add support for Correlation id.

- It is suggested to implement structured logging.

## Products Service Setup

```bash
cp .env.example .env
```

Update the .env file to match your database setup.

```
npm ci
npm run build
npm start
```

The API runs on `http://localhost:3000` with prefix `/api`.
Swagger docs are available at `http://localhost:3000/api/docs`.

Port 3000 in these links is the default. Replace it with the proper port defined in environment variable PORT.

## Docker Image

Build a local Docker image for the service:

```bash
docker build -t products-service .
```

Run the container with environment variables from `.env`:

```bash
docker run --rm -p 3000:3000 --env-file .env products-service
```

Add `--rm` to `docker run` command to remove the container after the run.

Note: The provided Dockerfile uses BuildKit caching therefore
it requires BuildKit for the build. Usually it is already enabled,
but if `docker build` command does not work properly in your setup, run build as:

```bash
DOCKER_BUILDKIT=1 docker build -t products-service .
```

Containerized endpoint examples:

- API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`

### Docker in Microservice Architecture

- When running multiple containers, place services on the same Docker network.
- Set `DB_HOST` to the database service/container name (for example `mysql`) instead of `127.0.0.1`.
- Ensure the database container is reachable on `DB_PORT`.

## Environment Variables

Can be modified in `.env` file:

```env
NODE_ENV=development
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=ecommerce_user
DB_PASSWORD=ecommerce_pass
SWAGGER_ENABLED=true
DB_SYNCHRONIZE=false
```

- In production, set `SWAGGER_ENABLED=false` unless API docs must be public/internal.
- Keep `DB_SYNCHRONIZE=false` in production. It is enabled in e2e tests only.

### Runtime Security and Shutdown

- Graceful shutdown is enabled via Nest shutdown hooks.
- No authorization is implemented since it was not mentioned in the requirements document.
- Since authorization is not specified in the requirements document, I assume this is internal service, therefore CORS and Helmet are not needed.

## API Documentation

Comprehensive API documentation is provided as an OpenAPI schema,
with Swagger UI for an interactive experience.

- OpenAPI schema: [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)

- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

You can also find API usage examples below.

### API Endpoints

Base URL: `http://localhost:3000/api/products`

#### Create Product

`POST /api/products`

```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "productToken": "SKU-1000",
    "name": "Laptop Stand",
    "price": 59.99,
    "stock": 10
  }'
```

Request:

```json
{
  "productToken": "SKU-1000",
  "name": "Laptop Stand",
  "price": 59.99,
  "stock": 10
}
```

Success response (`201`):

```json
{
  "id": 1,
  "productToken": "SKU-1000",
  "name": "Laptop Stand",
  "price": 59.99,
  "stock": 10,
  "updatedAt": "2026-03-13T10:00:00.000Z",
  "createdAt": "2026-03-13T10:00:00.000Z"
}
```

Product creation idempotency is handled by the uniqueness of productToken. Subsequent calls to the creation endpoint with the same productToken result in an HTTP 409 error.
It is important to handle this error properly on the requester side.

#### Read Products (Pagination Enabled)

`GET /api/products?page=1&limit=10`

```bash
curl "http://localhost:3000/api/products?page=1&limit=10"
```

Success response (`200`):

```json
{
  "items": [
    {
      "id": 1,
      "productToken": "SKU-1000",
      "name": "Laptop Stand",
      "price": 59.99,
      "stock": 10,
      "createdAt": "2026-03-13T10:00:00.000Z",
      "updatedAt": "2026-03-13T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Get Product

`GET /api/products/:id`

```bash
curl "http://localhost:3000/api/products/1"
```

Success response (`200`):

```json
{
  "id": 1,
  "productToken": "SKU-1000",
  "name": "Laptop Stand",
  "price": 59.99,
  "stock": 10,
  "createdAt": "2026-03-13T10:00:00.000Z",
  "updatedAt": "2026-03-13T10:00:00.000Z"
}
```

#### Update Product Stock

`PATCH /api/products/:id/stock`

```bash
curl -X PATCH "http://localhost:3000/api/products/1/stock" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 20
  }'
```

Request:

```json
{
  "stock": 20
}
```

Success response (`200`):

```json
{
  "id": 1,
  "productToken": "SKU-1000",
  "name": "Laptop Stand",
  "price": 59.99,
  "stock": 20,
  "createdAt": "2026-03-13T10:00:00.000Z",
  "updatedAt": "2026-03-13T10:05:00.000Z"
}
```

#### Delete Product

`DELETE /api/products/:id`

```bash
curl -X DELETE "http://localhost:3000/api/products/1"
```

Success response: `204 No Content`

### Validation and Error Handling

- Request validation uses `class-validator` + global `ValidationPipe`.
- Unknown fields are rejected (`forbidNonWhitelisted: true`).
- Sequelize unique constraint violations return `409 Conflict`.
- Missing product IDs return `404 Not Found`.
- Bad payloads return `400 Bad Request`.

### Response Contract Notes

- Product `createdAt` and `updatedAt` are returned as ISO 8601 date-time strings.

## Sequelize Model

Product Sequelize model is defined in:

- `src/products/models/product.model.ts`

## Test Commands

```bash
npm test
npm run test:e2e:lite
npm run test:e2e
npm run test:coverage
```

### Unit tests

- Command: `npm test`
- Unit tests covers: service, controller, mapper, filter, and env validation logic.
- Bootstrap and config files left untested intensionally.

### E2E test setups

Two e2e flavors are available and both are black-box at HTTP boundary (requests are sent via `supertest`):

- `npm run test:e2e:lite` (config: `test/jest-lite-e2e.json`)
  - Runs fast and does **not** require Docker.
  - Boots a Nest app in-process with `ProductsController`.
  - Uses a mocked `ProductsService` to validate request/response contract, routing, validation, and HTTP status behavior.
  - Best for quick feedback in local development and CI stages where Docker is not available.

- `npm run test:e2e` (config: `test/jest-docker-e2e.json`)
  - Full Docker blackbox setup via Testcontainers.
  - Starts an isolated network with:
    - MySQL container
    - Built `products-service` Docker image container
  - Executes real HTTP requests against the containerized service (`/api/products`), covering app bootstrap, DB wiring, schema init, and CRUD flow end-to-end.
  - Requires Docker daemon; slower but closer to production behavior.
