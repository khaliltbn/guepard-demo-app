# GuepardStore Demo App 🐆

Welcome to the GuepardStore Demo App! This is a full-stack e-commerce application built to showcase the powerful **database branching**, **versioning**, and **time-travel features** of the **Guepard PaaS**.

The application demonstrates how to use Guepard's git-like database features to safely develop, test, and deploy new features with isolated database branches.

![GuepardStore Demo App Screenshot](/readme/home.png)

## 🚀 What You'll Learn

This demo shows you how to:
- **Branch your database** like git branches for feature development
- **Switch between app versions** using Guepard's database branches
- **Apply feature patches** that modify both code and database schema
- **Rollback changes** safely without data loss
- **Use the Demo Control Panel** to manage database connections and features

## 🏗️ Tech Stack

This project is a monorepo containing two separate applications:

**Frontend** (`components/frontend/`):
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS & shadcn/ui components
- **State Management**: React Query + React Context
- **Routing**: React Router

**Backend** (`components/api/`):
- **Runtime**: Bun/Node.js
- **Framework**: Express.js + TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL (via Guepard PaaS)

## 📁 Project Structure

```
/
├── components/
│   ├── api/           # Backend API with Prisma
│   └── frontend/      # React frontend application
├── demo/
│   └── discount-feature/  # Feature patch system
├── readme/            # Screenshots and assets
└── README.md
```

## 🛠️ Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) (package manager and runtime)
- [Guepard Account](https://www.guepard.run/) (for database hosting)
- Git (for branch management)

## 🚀 Initial Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd demo-app-guepard

# Install backend dependencies
cd components/api
bun install

# Install frontend dependencies
cd ../frontend
bun install
```

### Step 2: Configure Environment Variables

**Backend Configuration** (`components/api/.env`):
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Guepard database URLs
DATABASE_URL="postgresql://username:password@your-guepard-host:5432/your-db"
SHADOW_DATABASE_URL="postgresql://username:password@your-guepard-host:5432/your-db_shadow"
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

**Frontend Configuration** (`components/frontend/.env`):
```bash
# Copy the example file
cp .env.example .env

# Edit .env (usually no changes needed)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=GuepardStore Demo
VITE_APP_VERSION=1.0.0
VITE_PORT=8080
VITE_HOST=::
```

### Step 3: Database Setup

```bash
# Navigate to backend directory
cd components/api

# Run initial migration
bunx prisma migrate dev --name "initial-schema"

# Seed the database with sample data
bunx prisma db seed
```

### Step 4: Start the Applications

**Terminal 1 - Backend:**
```bash
cd components/api
bun run dev
```

**Terminal 2 - Frontend:**
```bash
cd components/frontend
bun run dev
```

Your application should now be running at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001

## 🐳 Docker Setup (Alternative)

> **⚠️ Note**: Docker setup may have limitations with Guepard's git-like features. For the best demo experience, we recommend running the application natively (see setup instructions above).

If you prefer to use Docker, you have **two options**:

### **Option A: Separate Containers (Modular)**
```bash
# Development mode (with Guepard database)
docker-compose -f docker-compose.dev.yml up --build

# Switch between versions using Git branches
git checkout discout-feature  # Enable discount feature
git checkout main             # Back to main version
```

### **Option B: Single Container (Feature Patches Work)**
```bash
# Single container with both frontend and backend
docker-compose -f docker-compose.single.yml up --build

# Now feature patches work! Use Demo Control Panel or scripts
```

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md).

## 🎯 Testing Guepard's Git-Like Features

### Prerequisites: Install Guepard CLI

Before testing Guepard's features, you need to install and authenticate with the Guepard CLI:

```bash
# Install Guepard CLI (requires Rust)
git clone https://github.com/Guepard-Corp/guepard-cli
cd guepard-cli
cargo build --release

# Add to your PATH
sudo cp target/release/guepard /usr/local/bin/

# Authenticate with your Guepard account
guepard login
```

**Follow the interactive login process:**
1. Run `guepard login`
2. Open the provided URL in your browser
3. Complete authentication in the browser
4. Enter the verification code in the terminal

## 🐆 Essential Guepard CLI Commands

### Database Branch Management

```bash
# List all your deployments
guepard list deployments

# List branches for a deployment
guepard branch --deployment-id YOUR_DEPLOYMENT_ID

# Create a new branch
guepard branch \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --snapshot-id YOUR_SNAPSHOT_ID \
  --name feature-name \
  --checkout \
  --ephemeral

# Switch between branches
guepard checkout \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --branch-id BRANCH_ID

# Create snapshots (commits)
guepard commit \
  --message "Add discount feature" \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --branch-id BRANCH_ID
```

### Monitoring and Logs

```bash
# View deployment logs
guepard log --deployment-id YOUR_DEPLOYMENT_ID --follow

# Check compute status
guepard compute status --deployment-id YOUR_DEPLOYMENT_ID

# View usage and quotas
guepard usage
```

### Getting Help

```bash
# Get help for any command
guepard --help
guepard branch --help
guepard checkout --help

# Show current configuration
guepard config --show
```

### Method 1: Using the Demo Control Panel (Recommended)

The app includes a **Demo Control Panel** that provides a UI to manage database connections and feature patches.

1. **Open the Demo Control Panel**: Click the toggle button on the right side of the screen
2. **Configure Database Connections**: 
   - Paste your Guepard main database connection string
   - Optionally add a shadow database URL
   - Click "Update Backend .env"
3. **Apply Feature Patches**: Use the "Apply Feature Files" button to enable the discount feature
4. **Switch Database Branches**: Choose one of these options:
   - **Option A**: Use Guepard CLI: `guepard checkout --deployment-id YOUR_ID --branch-id BRANCH_ID`
   - **Option B**: Use Guepard Dashboard: Switch to the `discout-feature` branch in your browser
5. **Restart Backend**: Stop and restart your backend server to apply changes

### Method 2A: Using Feature Patch Scripts + Database Branch Management

This method uses automated scripts to apply/revert code changes while you manage database branches using either the CLI or dashboard.

#### Applying the Discount Feature

1. **Apply the code patch**:
   ```bash
   # From project root
   ./demo/discount-feature/apply-discount-feature.sh
   ```

2. **Create and switch to feature branch** (choose one option):
   
   **Option A: Using Guepard CLI**:
   ```bash
   # List your deployments to get the deployment ID
   guepard list deployments
   
   # Create a new branch for the discount feature
   guepard branch \
     --deployment-id YOUR_DEPLOYMENT_ID \
     --snapshot-id YOUR_SNAPSHOT_ID \
     --name discout-feature \
     --checkout \
     --ephemeral
   ```
   
   **Option B: Using Guepard Dashboard**:
   - Go to your Guepard dashboard
   - Create a new branch called `discout-feature`
   - Switch to the new branch

3. **Update backend**:
   ```bash
   cd components/api
   # Stop the server (Ctrl+C)
   bunx prisma db push
   # Restart the server
   bun run dev
   ```

4. **Restart frontend**:
   ```bash
   cd components/frontend
   # Stop the server (Ctrl+C)
   bun run dev
   ```

5. **Verify the change**: Product cards should now show discounted prices with strikethrough original prices.

#### Rolling Back the Discount Feature

1. **Revert the code patch**:
   ```bash
   # From project root
   ./demo/discount-feature/rollback-discount-feature.sh
   ```

2. **Switch back to main branch** (choose one option):
   
   **Option A: Using Guepard CLI**:
   ```bash
   # List branches to see available options
   guepard branch --deployment-id YOUR_DEPLOYMENT_ID
   
   # Checkout the main branch
   guepard checkout \
     --deployment-id YOUR_DEPLOYMENT_ID \
     --branch-id MAIN_BRANCH_ID
   ```
   
   **Option B: Using Guepard Dashboard**:
   - Go to your Guepard dashboard
   - Switch back to the `main` branch

3. **Update backend**:
   ```bash
   cd components/api
   # Stop the server (Ctrl+C)
   bunx prisma db push
   # Restart the server
   bun run dev
   ```

4. **Restart frontend**:
   ```bash
   cd components/frontend
   # Stop the server (Ctrl+C)
   bun run dev
   ```

5. **Verify the rollback**: The app should be back to its original state without discounts.

### Method 2B: Using Git Branch Checkout + Database Branch Management

This method uses Git branches for code changes and either CLI or dashboard for database branch management.

#### Applying the Discount Feature

1. **Checkout the discount feature branch**:
   ```bash
   # From project root
   git checkout discout-feature
   ```

2. **Create and switch to feature database branch** (choose one option):
   
   **Option A: Using Guepard CLI**:
   ```bash
   # Create a new database branch for the discount feature
   guepard branch \
     --deployment-id YOUR_DEPLOYMENT_ID \
     --snapshot-id YOUR_SNAPSHOT_ID \
     --name discout-feature \
     --checkout \
     --ephemeral
   ```
   
   **Option B: Using Guepard Dashboard**:
   - Go to your Guepard dashboard
   - Create a new branch called `discout-feature`
   - Switch to the new branch

3. **Update backend**:
   ```bash
   cd components/api
   # Stop the server (Ctrl+C)
   bunx prisma db push
   # Restart the server
   bun run dev
   ```

4. **Restart frontend**:
   ```bash
   cd components/frontend
   # Stop the server (Ctrl+C)
   bun run dev
   ```

5. **Verify the change**: Product cards should now show discounted prices with strikethrough original prices.

#### Rolling Back the Discount Feature

1. **Checkout back to main branch**:
   ```bash
   # From project root
   git checkout main
   ```

2. **Switch back to main database branch** (choose one option):
   
   **Option A: Using Guepard CLI**:
   ```bash
   # Checkout the main database branch
   guepard checkout \
     --deployment-id YOUR_DEPLOYMENT_ID \
     --branch-id MAIN_BRANCH_ID
   ```
   
   **Option B: Using Guepard Dashboard**:
   - Go to your Guepard dashboard
   - Switch back to the `main` branch

3. **Update backend**:
   ```bash
   cd components/api
   # Stop the server (Ctrl+C)
   bunx prisma db push
   # Restart the server
   bun run dev
   ```

4. **Restart frontend**:
   ```bash
   cd components/frontend
   # Stop the server (Ctrl+C)
   bun run dev
   ```

5. **Verify the rollback**: The app should be back to its original state without discounts.

## 🔄 Available Git Branches

The repository includes these branches for testing:

- **`main`**: Base application without discount features
- **`discout-feature`**: Database branch with discount schema and data

## 🎮 Demo Control Panel Features

The Demo Control Panel provides:

- **Database Status**: Shows current database connection and feature patch status
- **Connection Management**: Update backend .env with new Guepard database URLs
- **Feature Management**: Apply/revert discount feature patches
- **Database Actions**: Run seed scripts manually
- **Auto-refresh**: Status updates every 15 seconds

## 📊 Database Schema

The application uses these main models:

- **Category**: Product categories with name, slug, description
- **Product**: Products with name, description, price, stock, image
- **Order**: Customer orders with client info and total amount
- **OrderItem**: Individual items within orders

## 🛠️ Available Scripts

**Backend** (`components/api/`):
```bash
bun run dev              # Start development server
bunx prisma migrate dev  # Create and apply migrations
bunx prisma db seed      # Seed database with sample data
bunx prisma studio       # Open Prisma Studio (database GUI)
bunx prisma generate     # Generate Prisma client
```

**Frontend** (`components/frontend/`):
```bash
bun run dev      # Start Vite development server
bun run build    # Create production build
bun run preview  # Preview production build
```

## 🐛 Troubleshooting

**Database Connection Issues**:
- Verify your Guepard database URLs are correct
- Ensure your Guepard database is running
- Check that the shadow database URL is properly configured

**Migration Issues**:
- If migrations fail, try `bunx prisma generate` first
- For existing branches, you may need to reset: `bunx prisma migrate reset`

**Feature Patch Issues**:
- Ensure you have backup files (`.bak` files) before applying patches
- If rollback fails, check that all backup files exist
- Restart both servers after applying/rolling back patches

**Port Conflicts**:
- Backend runs on port 3001 by default
- Frontend runs on port 8080 by default
- Change ports in `.env` files if needed

## 🎯 Next Steps

After completing this demo, you can:

1. **Explore Guepard's advanced features**: Time-travel, branching strategies, data isolation
2. **Create your own feature branches**: Develop new features with isolated database states
3. **Integrate with CI/CD**: Use Guepard's API to automate database branch management
4. **Scale your application**: Leverage Guepard's managed PostgreSQL for production workloads

## 📚 Additional Resources

- [Guepard Documentation](https://docs.guepard.run/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React + Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

This is a demo application. Feel free to fork and experiment with different features and Guepard capabilities!