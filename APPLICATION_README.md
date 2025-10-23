# GuepardStore Application Documentation

This document provides detailed technical information about the GuepardStore demo application itself.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Frontend Integration](#frontend-integration)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

GuepardStore is a full-stack e-commerce demo application designed to showcase Guepard's git-like database features. It includes:

- **Public Product Catalog**: Browse and search products
- **Shopping Cart**: Add items and manage quantities
- **Order Management**: Place orders with customer information
- **Admin Dashboard**: Manage products and inventory
- **Demo Control Panel**: Interactive Guepard feature management

## 🏗️ Architecture

The application follows a modern microservices architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express Backend│    │  Guepard DB     │
│   (Port 8080)   │◄──►│   (Port 3001)   │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vite Dev      │    │   Prisma ORM    │    │   Database      │
│   Server        │    │   Client        │    │   Branching     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + React Context
- **Routing**: React Router
- **HTTP Client**: Fetch API

### **Backend**
- **Runtime**: Bun/Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Guepard-managed)
- **Validation**: Built-in Express validation

### **Database**
- **Provider**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Seeding**: Prisma Seed
- **Versioning**: Guepard PaaS

## 📁 Project Structure

```
guepardstore-demo/
├── components/
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── lib/            # Utilities
│   │   │   └── index.ts        # Server entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seed.ts         # Database seeding
│   │   ├── package.json
│   │   └── Dockerfile
│   └── frontend/               # React Frontend
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Page components
│       │   ├── services/       # API services
│       │   ├── contexts/       # React contexts
│       │   ├── types/          # TypeScript types
│       │   └── App.tsx         # App entry point
│       ├── package.json
│       └── Dockerfile
├── demo/                       # Demo scripts and patches
│   └── discount-feature/
│       ├── apply-discount-feature.sh
│       └── rollback-discount-feature.sh
├── .github/workflows/          # GitHub Actions
├── docker-compose.yml          # Docker orchestration
├── Dockerfile.single           # Single container setup
└── README.md                   # Main documentation
```

## 🚀 Setup Instructions

### **Prerequisites**

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) (recommended) or npm
- [Guepard Account](https://guepard.run/) (for database)
- [Git](https://git-scm.com/)

### **1. Clone and Install**

```bash
# Clone the repository
git clone https://github.com/your-org/guepardstore-demo
cd guepardstore-demo

# Install backend dependencies
cd components/api
bun install
cd ../..

# Install frontend dependencies
cd components/frontend
bun install
cd ../..
```

### **2. Database Setup**

```bash
# Set up Guepard deployment (if not already done)
guepard deploy --interactive

# Configure environment variables
cp components/api/.env.example components/api/.env
cp components/frontend/.env.example components/frontend/.env

# Add your Guepard database URL to components/api/.env
# DATABASE_URL="postgresql://username:password@host:port/database"
```

### **3. Database Migration and Seeding**

```bash
cd components/api

# Push schema to database
bunx prisma db push

# Seed the database
bunx prisma db seed

cd ../..
```

### **4. Start the Application**

```bash
# Terminal 1 - Backend
cd components/api
bun run dev

# Terminal 2 - Frontend
cd components/frontend
bun run dev
```

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## 📡 API Documentation

### **Base URL**
```
http://localhost:3001/api
```

### **Endpoints**

#### **Products**
```bash
GET    /products           # List all products
GET    /products/:id       # Get product by ID
POST   /products           # Create new product
PUT    /products/:id       # Update product
DELETE /products/:id       # Delete product
```

#### **Categories**
```bash
GET    /categories         # List all categories
GET    /categories/:id     # Get category by ID
POST   /categories         # Create new category
PUT    /categories/:id     # Update category
DELETE /categories/:id     # Delete category
```

#### **Orders**
```bash
GET    /orders             # List all orders
GET    /orders/:id         # Get order by ID
POST   /orders             # Create new order
PUT    /orders/:id         # Update order status
```

#### **Demo Control**
```bash
GET    /demo-control/status              # Get database status
GET    /demo-control/feature-status/:name # Get feature status
POST   /demo-control/manage-feature      # Apply/rollback features
POST   /demo-control/switch-db           # Switch database connection
POST   /demo-control/run-seed            # Run database seeding
```

### **Request/Response Examples**

#### **Create Product**
```bash
POST /api/products
Content-Type: application/json

{
  "name": "Sample Product",
  "description": "A sample product description",
  "price": 29.99,
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg",
  "categoryId": "category-uuid"
}
```

#### **Create Order**
```bash
POST /api/orders
Content-Type: application/json

{
  "clientInfo": {
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St"
  },
  "cartItems": [
    {
      "id": "product-uuid",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2
    }
  ]
}
```

## 🗄️ Database Schema

### **Models**

#### **Category**
```prisma
model Category {
  id          String    @id @default(uuid()) @db.Uuid
  name        String    @unique @db.VarChar(100)
  slug        String    @unique @db.VarChar(100)
  description String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  products    Product[]
}
```

#### **Product**
```prisma
model Product {
  id            String    @id @default(uuid()) @db.Uuid
  name          String    @db.VarChar(255)
  description   String
  price         Decimal   @db.Decimal(10, 2)
  discountPrice Decimal?  @map("discount_price") @db.Decimal(10, 2)
  stock         Int       @default(0)
  imageUrl      String?   @map("image_url")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  category      Category  @relation(fields: [categoryId], references: [id])
  categoryId    String    @map("category_id") @db.Uuid
  orderItems    OrderItem[]
}
```

#### **Order**
```prisma
model Order {
  id            String    @id @default(uuid()) @db.Uuid
  clientName    String    @map("client_name")
  clientPhone   String    @map("client_phone")
  clientAddress String    @map("client_address")
  totalAmount   Decimal   @map("total_amount") @db.Decimal(10, 2)
  status        String    @default("pending") @db.VarChar(50)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  orderItems    OrderItem[]
}
```

#### **OrderItem**
```prisma
model OrderItem {
  id          String    @id @default(uuid()) @db.Uuid
  order       Order     @relation(fields: [orderId], references: [id])
  orderId     String    @map("order_id") @db.Uuid
  product     Product   @relation(fields: [productId], references: [id])
  productId   String    @map("product_id") @db.Uuid
  quantity    Int
  priceAtTime Decimal   @map("price_at_time") @db.Decimal(10, 2)
  createdAt   DateTime  @default(now()) @map("created_at")
}
```

### **Feature Branch Schema Variations**

The discount feature adds a `discountPrice` field to the Product model, demonstrating schema evolution with Guepard.

## 🔗 Frontend Integration

### **API Service Layer**

The frontend uses a centralized API service (`src/services/api.ts`) for all backend communication:

```typescript
// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Product operations
export const getProducts = async (params?: GetProductsParams): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return response.json();
};

export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return response.json();
};
```

### **State Management**

- **Server State**: React Query for API data caching and synchronization
- **Client State**: React Context for UI state (cart, theme, etc.)

### **Component Structure**

```
src/
├── components/
│   ├── ProductCard.tsx      # Product display component
│   ├── ProductForm.tsx      # Product creation/editing
│   ├── Cart.tsx            # Shopping cart
│   ├── DemoControlPanel.tsx # Guepard feature management
│   └── ...
├── pages/
│   ├── Home.tsx            # Product catalog
│   ├── Admin.tsx            # Admin dashboard
│   └── ...
└── contexts/
    ├── CartContext.tsx      # Shopping cart state
    └── ThemeContext.tsx     # Theme management
```

## 🐳 Docker Deployment

### **Single Container (Feature Patches Work)**

```bash
# Build and run single container
docker-compose -f docker-compose.single.yml up --build

# Access points:
# Frontend: http://localhost:8080
# Backend: http://localhost:3001
```

### **Separate Containers (Modular)**

```bash
# Development mode
docker-compose -f docker-compose.dev.yml up --build

# Production mode
docker-compose up --build
```

### **Individual Services**

```bash
# Backend only
cd components/api
docker build -t guepard-api .
docker run -p 3001:3001 --env-file .env guepard-api

# Frontend only
cd components/frontend
docker build -t guepard-frontend .
docker run -p 8080:8080 guepard-frontend
```

## 🔧 Environment Variables

### **Backend (.env)**
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"
SHADOW_DATABASE_URL="postgresql://username:password@host:port/shadow"

# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:8080
```

### **Frontend (.env)**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Application Configuration
VITE_APP_NAME=GuepardStore Demo
VITE_APP_VERSION=1.0.0

# Development Server Configuration
VITE_PORT=8080
VITE_HOST=::
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
```bash
❌ Can't reach database server
```
**Solutions:**
- Verify `DATABASE_URL` in `.env` file
- Check Guepard deployment status
- Ensure network connectivity

#### **CORS Errors**
```bash
❌ Cross-Origin Request Blocked
```
**Solutions:**
- Check `FRONTEND_URL` in backend `.env`
- Verify frontend is running on correct port
- Update CORS configuration in `index.ts`

#### **Prisma Issues**
```bash
❌ Prisma Client not generated
```
**Solutions:**
```bash
cd components/api
bunx prisma generate
bunx prisma db push
```

#### **Port Conflicts**
```bash
❌ Port already in use
```
**Solutions:**
- Check what's using the ports: `lsof -i :3001` or `lsof -i :8080`
- Change ports in `.env` files
- Stop conflicting services

### **Debug Mode**

Enable debug logging:

```bash
# Backend
cd components/api
DEBUG=* bun run dev

# Frontend
cd components/frontend
VITE_DEBUG=true bun run dev
```

### **Database Reset**

```bash
cd components/api

# Reset database
bunx prisma migrate reset

# Or push schema directly
bunx prisma db push

# Reseed data
bunx prisma db seed
```

## 📊 Performance Considerations

### **Database Optimization**
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Use connection pooling for high concurrency

### **Frontend Optimization**
- Implement React.memo for expensive components
- Use React Query for efficient data caching
- Optimize bundle size with code splitting

### **API Optimization**
- Implement request/response compression
- Use HTTP caching headers
- Add rate limiting for production

## 🔒 Security Considerations

### **API Security**
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Rate limiting

### **Data Protection**
- Environment variable security
- Database connection encryption
- Secure password handling

## 📈 Monitoring and Logging

### **Application Logs**
- Backend: Console logging with timestamps
- Frontend: Browser console and network tabs
- Database: Prisma query logging

### **Performance Monitoring**
- API response times
- Database query performance
- Frontend bundle size analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For application-specific issues:
- Check this documentation
- Review GitHub Issues
- Contact the development team

For Guepard-related issues:
- [Guepard Documentation](https://docs.guepard.run)
- [Guepard Support](https://support.guepard.run)

---

**🐆 Happy coding with GuepardStore!**