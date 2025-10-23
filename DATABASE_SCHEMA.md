# Database Schema (Prisma)

This document defines the database schema for the GuepardStore Demo App. This project uses **Prisma** as its ORM (Object-Relational Mapper) and demonstrates **Guepard's git-like database branching** capabilities.

## Prisma Schema

The following schema defines all models, fields, and relations. It is used by Prisma to generate database migrations and the type-safe client.

```prisma
// file: components/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

model Category {
  id          String    @id @default(uuid()) @db.Uuid
  name        String    @unique @db.VarChar(100)
  slug        String    @unique @db.VarChar(100)
  description String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  products    Product[]
}

model Product {
  id          String    @id @default(uuid()) @db.Uuid
  name        String    @db.VarChar(255)
  description String
  price       Decimal   @db.Decimal(10, 2)
  stock       Int       @default(0)
  imageUrl    String?   @map("image_url")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  category    Category  @relation(fields: [categoryId], references: [id])
  categoryId  String    @map("category_id") @db.Uuid
  orderItems  OrderItem[]
}

model Order {
  id          String    @id @default(uuid()) @db.Uuid
  // userId      String?   @map("user_id") @db.Uuid // We'll keep this commented for now
  clientName    String    @map("client_name")
  clientPhone   String    @map("client_phone")
  clientAddress String    @map("client_address")
  
  totalAmount Decimal   @map("total_amount") @db.Decimal(10, 2)
  status      String    @default("pending") @db.VarChar(50)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  orderItems  OrderItem[]
}

model OrderItem {
  id          String    @id @default(uuid()) @db.Uuid
  order       Order     @relation(fields: [orderId], references: [id])
  orderId     String    @map("order_id") @db.Uuid
  product     Product   @relation(fields: [productId], references: [id])
  productId   String    @map("product_id") @db.Uuid
  quantity    Int
  priceAtTime Decimal   @map("price_at_time") @db.Decimal(10, 2)
  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("order_items")
}
```

## Guepard Integration Features

### Shadow Database Support
The schema includes `shadowDatabaseUrl` configuration for Prisma migrations, which is essential for Guepard's database branching:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

### Database Branching Workflow
1. **Main Branch**: Contains the base schema without discount features
2. **Feature Branches**: Guepard creates isolated database branches (e.g., `discout-feature`) with schema modifications
3. **Migration Management**: Prisma migrations are applied to specific branches without affecting others

---
## How Business Logic is Handled

In this project, complex business rules are handled within the application layer (the Node.js backend) rather than with database triggers. This keeps the logic centralized and easier to manage.

### Auto-updating Timestamps
- The `created_at` timestamp is set automatically by the database using Prisma's `@default(now())` attribute.
- The `updated_at` timestamp is automatically updated on every record change by Prisma's `@updatedAt` attribute.

### Stock Validation and Updates
- To ensure data consistency, stock validation and updates are performed within a **Prisma transaction** (`prisma.$transaction`) in the `/api/orders` endpoint.
- This guarantees that an order is only created if all items are in stock, and the stock is only decreased if the order is successfully created. This atomic operation prevents race conditions and data corruption.

---
## Data Seeding

Sample data is managed via a seed script at `components/api/prisma/seed.ts`. This script populates the database with initial categories and products.

You can run the seed script using:
```bash
cd components/api
bunx prisma db seed
```

**Note**: The seed script only runs if the database is empty, preventing accidental data duplication.

---
## API Endpoints (Implemented)

### Products
- `GET /api/products`: Lists products (supports `q` for search and `category` for filtering).
- `POST /api/products`: Creates a new product (admin).
- `PUT /api/products/:id`: Updates a product (admin).
- `DELETE /api/products/:id`: Deletes a product (admin).

### Categories
- `GET /api/categories`: Lists all categories.

### Orders
- `POST /api/orders`: Creates a new order, validates stock, and updates product quantities.

### Demo Control Panel
- `GET /api/demo-control/status`: Returns current database connection status
- `GET /api/demo-control/feature-status/:featureName`: Checks if a feature patch is applied
- `POST /api/demo-control/manage-feature`: Applies or reverts feature patches
- `POST /api/demo-control/switch-db`: Updates database connection strings
- `POST /api/demo-control/run-seed`: Runs database seeding

---
## Query Examples (with Prisma Client)

These examples show how to perform common queries using the type-safe Prisma Client in the backend.

### Get products with category info
```typescript
const productsWithCategories = await prisma.product.findMany({
  include: {
    category: true, // Joins the category table
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Get a single order with its items and product details
```typescript
const orderDetails = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    orderItems: { // Nested join on order items
      include: {
        product: true, // Further nest to get product details for each item
      },
    },
  },
});
```

### Products with low stock alert
```typescript
const lowStockProducts = await prisma.product.findMany({
  where: {
    stock: {
      lt: 10, // 'lt' means 'less than'
    },
  },
  orderBy: {
    stock: 'asc',
  },
});
```

---
## Feature Branch Schema Variations

### Discount Feature Schema
When the discount feature is applied (via scripts or git checkout), the schema includes additional fields:

```prisma
model Product {
  // ... existing fields
  discountPrice Decimal? @map("discount_price") @db.Decimal(10, 2)
  discountPercentage Int? @map("discount_percentage")
  isOnSale Boolean @default(false) @map("is_on_sale")
}
```

This demonstrates how Guepard's database branching allows for:
- **Schema Evolution**: Different branches can have different schemas
- **Safe Testing**: Test new features without affecting production data
- **Easy Rollback**: Revert schema changes by switching branches

---
## Performance & Security

- **Prisma Client**: Provides type-safe database access and prevents SQL injection
- **Transaction Support**: Ensures data consistency for complex operations
- **Connection Pooling**: Managed by Prisma for optimal performance
- **Data Validation**: Handled at the API layer before database operations

## Migration Commands

```bash
# Create and apply migrations
bunx prisma migrate dev --name "migration-name"

# Generate Prisma client
bunx prisma generate

# Reset database (development only)
bunx prisma migrate reset

# View database in Prisma Studio
bunx prisma studio
```