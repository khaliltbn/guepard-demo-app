# Frontend & Backend Integration Guide (React + Node.js)

This document explains how to connect the React frontend to the Node.js backend built for the GuepardStore Demo App, including the **Demo Control Panel** for managing Guepard's git-like database features.

## Current Setup

The application is composed of a React frontend and a Node.js/Express backend that uses Prisma to communicate with a PostgreSQL database hosted on **Guepard PaaS**. The integration includes a sophisticated demo control panel for managing database branches and feature patches.

## Project Structure

```
components/
├── api/                    # Backend API with Prisma
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   │   ├── productRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   └── demoControlRoutes.ts  # Demo control panel API
│   │   └── index.ts        # Express server setup
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── seed.ts         # Database seeding
└── frontend/               # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── DemoControlPanel.tsx  # Demo control UI
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductForm.tsx
    │   │   └── ui/          # shadcn/ui components
    │   ├── pages/
    │   │   ├── Catalog.tsx
    │   │   └── Admin.tsx
    │   ├── services/
    │   │   └── api.ts       # API service layer
    │   └── types/
    │       └── types.ts     # TypeScript definitions
```

## Files to Update

### 1. API Service Layer (`components/frontend/src/services/api.ts`)

This file centralizes all communication with the backend API. It exports typed functions for each endpoint.

```typescript
import { Product, Category } from "../types/types";
import { CartItem } from '@/contexts/CartContext'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
};

type GetProductsParams = {
  search?: string;
  category?: string; 
};

export interface OrderPayload {
  clientInfo: {
    name: string;
    phone: string;
    address: string;
  };
  cartItems: CartItem[];
}

export const getProducts = async (params: GetProductsParams = {}): Promise<Product[]> => {
  const queryParams = new URLSearchParams();

  if (params.search) {
    queryParams.append('q', params.search);
  }
  if (params.category) {
    queryParams.append('category', params.category);
  }

  const queryString = queryParams.toString();
  const requestUrl = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(requestUrl);
  if (!response.ok) throw new Error('Failed to fetch products');

  const products: Product[] = await response.json();
  return products.map(product => ({
    ...product,
    price: parseFloat(product.price as any), 
  }));
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

export const updateProduct = async ({ id, data }: { id: string; data: Partial<ProductFormData> }): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete product');
};

export const createOrder = async (orderData: OrderPayload) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create order');
  }

  return response.json();
};
```

### 2. Demo Control Panel (`components/frontend/src/components/DemoControlPanel.tsx`)

The Demo Control Panel provides a UI for managing Guepard's database features:

**Key Features:**
- **Database Status Monitoring**: Shows current database connection and feature patch status
- **Connection Management**: Update backend .env with new Guepard database URLs
- **Feature Management**: Apply/revert discount feature patches
- **Database Actions**: Run seed scripts manually
- **Auto-refresh**: Status updates every 15 seconds

**API Integration:**
```typescript
// Demo Control Panel API calls
const fetchStatus = async (): Promise<{ currentDatabase: string; rawDbUrl: string; rawShadowDbUrl: string; }> => {
  const res = await fetch(`${demoControlApiBase}/status`);
  if (!res.ok) throw new Error(`Failed to fetch status: ${res.status}`);
  return res.json();
};

const updateBackendEnv = async (payload: SwitchDbPayload): Promise<ScriptResponse> => {
  const res = await fetch(`${demoControlApiBase}/switch-db`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload) 
  });
  if (!res.ok) throw new Error('Failed to update .env');
  return res.json();
};

const manageFeature = async (payload: ManageFeaturePayload): Promise<ScriptResponse> => {
  const res = await fetch(`${demoControlApiBase}/manage-feature`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload) 
  });
  if (!res.ok) throw new Error('Failed to manage feature');
  return res.json();
};
```

### 3. Catalog Page (`components/frontend/src/pages/Catalog.tsx`)

The catalog page uses React Query for data fetching with real-time updates:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '@/services/api';

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();

  // Fetch products with filtering
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: ({ queryKey }) => {
      const [_key, search, category] = queryKey;
      return getProducts({ search: search as string, category: category as string });
    },
  });
  
  // Fetch categories for the filter bar
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // ... rest of component with Demo Control Panel integration
};
```

### 4. Admin Page (`components/frontend/src/pages/Admin.tsx`)

The admin page uses React Query for CRUD operations with optimistic updates:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct, ProductFormData } from '@/services/api';

const Admin = () => {
  const queryClient = useQueryClient();

  // Fetch all products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product created successfully" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) => 
      updateProduct({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product updated successfully" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product deleted successfully" });
    },
  });

  // ... rest of component
};
```

## Environment Variables

### Frontend Configuration (`components/frontend/.env`)

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

### Backend Configuration (`components/api/.env`)

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@your-guepard-host:5432/your-db"
SHADOW_DATABASE_URL="postgresql://username:password@your-guepard-host:5432/your-db_shadow"

# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:8080
```

## Backend CORS Setup (Node.js + Express)

The backend is configured to allow CORS requests from the frontend in `components/api/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import demoControlRoutes from './routes/demoControlRoutes';

const app = express();
const port = 3001;
const host = '0.0.0.0'; 

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',  // Vite default dev server port
  'http://192.168.1.23:8080' // Additional network access
];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/demo-control', demoControlRoutes); // Demo control panel API

app.listen(port, host, () => {
  console.log(`🐆 Guepard Demo API is running on http://localhost:${port}`);
});
```

## Demo Control Panel API Endpoints

The demo control panel provides these API endpoints for managing Guepard features:

### Database Management
- `GET /api/demo-control/status`: Returns current database connection status
- `POST /api/demo-control/switch-db`: Updates database connection strings in backend .env

### Feature Management
- `GET /api/demo-control/feature-status/:featureName`: Checks if a feature patch is applied
- `POST /api/demo-control/manage-feature`: Applies or reverts feature patches

### Database Actions
- `POST /api/demo-control/run-seed`: Runs database seeding (only if database is empty)

## Testing the Integration

1. **Start your Node.js backend**: `bun run dev` in the `components/api` directory.
2. **Start the React frontend**: `bun run dev` in the `components/frontend` directory.
3. **Open browser**: Navigate to `http://localhost:5173` (or your Vite port).
4. **Test Demo Control Panel**: Click the toggle button on the right side to open the demo control panel.
5. **Check browser console**: Look for any API or CORS errors.
6. **Check network tab**: Verify API calls to `localhost:3001` are being made with a `200` status.

## Guepard Integration Workflow

### Using the Demo Control Panel

1. **Configure Database Connections**:
   - Open the Demo Control Panel
   - Paste your Guepard main database connection string
   - Optionally add a shadow database URL
   - Click "Update Backend .env"

2. **Apply Feature Patches**:
   - Use the "Apply Feature Files" button to enable the discount feature
   - Switch to the `discout-feature` branch in your Guepard dashboard
   - Restart the backend server

3. **Monitor Status**:
   - The panel shows current database connection and feature patch status
   - Status updates automatically every 15 seconds

### Using Scripts or Git Branches

1. **Apply Feature Patches**: Run `./demo/discount-feature/apply-discount-feature.sh`
2. **Switch Database Branches**: Use Guepard dashboard to switch to `discout-feature` branch
3. **Update Backend**: Run migrations and restart server
4. **Restart Frontend**: Restart frontend server to load new code

## Next Steps

1. ✅ Set up Node.js backend with Express and Prisma
2. ✅ Install Prisma and configure Guepard database connection
3. ✅ Run Prisma migrations to create the database schema
4. ✅ Run the Prisma seed script to populate data
5. ✅ Create the API service layer in the frontend (`src/services/api.ts`)
6. ✅ Replace mock data in pages with React Query hooks
7. ✅ Implement Demo Control Panel for Guepard feature management
8. ✅ Test all CRUD operations and cart functionality
9. ✅ Test database branching and feature patch workflows
10. ✅ Deploy both frontend and backend

## Useful Commands

```bash
# Frontend
bun run dev          # Start Vite dev server
bun run build        # Build for production
bun run preview      # Preview production build

# Backend
bun run dev          # Start Express dev server
bunx prisma migrate dev # Create and apply database migrations
bunx prisma db seed  # Run the seed script to populate the database
bunx prisma studio   # Open a web UI to view and edit database data
bunx prisma generate # Generate Prisma client

# Demo Control
./demo/discount-feature/apply-discount-feature.sh    # Apply discount feature
./demo/discount-feature/rollback-discount-feature.sh  # Rollback discount feature
```

## Troubleshooting

**CORS Issues**:
- Ensure your frontend URL is in the `allowedOrigins` array
- Check that the backend is running on the correct port (3001)

**Database Connection Issues**:
- Verify your Guepard database URLs are correct
- Ensure your Guepard database is running
- Check that the shadow database URL is properly configured

**Feature Patch Issues**:
- Ensure you have backup files (`.bak` files) before applying patches
- If rollback fails, check that all backup files exist
- Restart both servers after applying/rolling back patches

**Demo Control Panel Issues**:
- Check browser console for API errors
- Verify backend demo control routes are working
- Ensure proper CORS configuration for the demo control endpoints