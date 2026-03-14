# Products Service (NestJS + Sequelize + MySQL)

Backend microservice for managing e-commerce products using NestJS and Sequelize.

## Notes & Suggestions

- All database fields and validation limits are just examples.
  In real world scenario they will be derived from the domain.

- Price is implemented as decimal as it was defined in the requirements document.
  It is suggest considering price representation as integer (in cents) to avoid possible rounding issues.

- Product update is implemented to only change stock value as it was requested in the requirements document.
  In practice a method or separate methods to update product name and price are needed as well.

- No authorisation is implemented since they were not mentioned in the requirements document.

- It is suggested to add support for Correlation id.

- It is suggested to implement structured logging.

- Product creation endpoint is not idempotent in current implementation.
  We can switch to 2-step product creation process if we need idempotance
  (get new id -> set product data; expire/delete unused ids).

## Products Service Setup

```bash
cp .env.example .env
```

Update .env file to match you database setup.

```
npm ci
npm run build
npm start
```

The API runs on `http://localhost:3000` with prefix `/api`.
Swagger docs are available at `http://localhost:3000/api/docs`.

## API Documentation

- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Environment Variables

In `.env`:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=ecommerce_user
DB_PASSWORD=ecommerce_pass
```

## API Endpoints (CRUD + Pagination)

Base URL: `http://localhost:3000/api/products`

### Create Product

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

### Read Products (Pagination Enabled)

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

### Get Product

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

Not found (`404`):

```json
{
  "statusCode": 404,
  "message": "Product with id 999 not found",
  "error": "Not Found"
}
```

### Update Product Stock

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

### Delete Product

`DELETE /api/products/:id`

```bash
curl -X DELETE "http://localhost:3000/api/products/1"
```

Success response: `204 No Content`

## Validation and Error Handling

- Request validation uses `class-validator` + global `ValidationPipe`.
- Unknown fields are rejected (`forbidNonWhitelisted: true`).
- Sequelize unique constraint violations return `409 Conflict`.
- Missing product IDs return `404 Not Found`.
- Bad payloads return `400 Bad Request`.

## Response Contract Notes

- Product `createdAt` and `updatedAt` are returned as ISO 8601 date-time strings.

## Sequelize Model

Product Sequelize model is defined in:

- `src/products/models/product.model.ts`

## Test Commands

From `products-service`:

```bash
npm test
npm run test:e2e
```

Unit and e2e tests cover service/controller behavior and request validation.
