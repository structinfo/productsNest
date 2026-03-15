# Products Service (NestJS + Sequelize + MySQL)

Backend microservice for managing e-commerce products using NestJS and Sequelize.

## Notes & Suggestions

- All database fields and validation limits are just examples.
  In a real-world scenario, these should be derived from the domain.

- Price is implemented as decimal as it was defined in the requirements document.
  It is suggested to represent price as an integer (in cents) to avoid possible rounding issues.

- Product updates currently only support changing stock, as requested in the requirements document.
  In practice, separate methods to update product name and price are needed as well.

- No authorization is implemented since it was not mentioned in the requirements document.

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

## Environment Variables

Can be modified in `.env` file:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=ecommerce_user
DB_PASSWORD=ecommerce_pass
```

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

From `products-service`:

```bash
npm test
npm run test:e2e
```

Unit and e2e tests cover service/controller behavior and request validation.
