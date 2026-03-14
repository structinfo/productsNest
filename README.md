# Products Service (NestJS + Sequelize + MySQL)

Demo backend microservice for managing e-commerce products using NestJS and Sequelize.

## Project Structure

- `products-service` - NestJS TypeScript microservice
- `devenv/database` - local MySQL Docker setup and SQL initialization

## 1) Local Database Setup

A local MySQL database is provided via Docker Compose.

1. Start database:

```bash
cd devenv/database
docker compose up -d
```

2. This creates:
   - Database: `ecommerce`
   - Table: `products`
   - Host port mapping: `3306 -> 3306` (`127.0.0.1:3306` for local app access)
   - Internal container port exposed for app/container networking: `3306`

3. SQL initialization is in:
   - `devenv/database/init/01-create-products.sql`

## 2) Products Service Setup & Usage

Switch to `products-service` folder

```bash
cd products-service
```

then follow README.md provided in the service folder.

Have fun!
