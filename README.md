# GuepardStore Demo App 🐆

Welcome to the GuepardStore Demo App! This is a full-stack e-commerce application built to showcase the powerful database branching, versioning, and time-travel features of the **Guepard PaaS**.

The application is a modern, responsive product management system featuring a public product catalog, a shopping cart, and a password-protected admin dashboard for managing inventory.

![GuepardStore Demo App Screenshot](/readme/home.png)

## 🎯 What is Guepard?

**Guepard** is a revolutionary Platform-as-a-Service (PaaS) that brings Git-like version control to your databases. Just like Git revolutionized code management, Guepard transforms how you handle database changes, deployments, and collaboration.

### 🌟 Key Features

- **🔄 Database Branching**: Create isolated database branches for features, experiments, and testing
- **📸 Snapshots**: Capture database states at any point in time
- **⏰ Time Travel**: Roll back to any previous database state instantly
- **🚀 Zero-Downtime Deployments**: Deploy database changes without service interruption
- **👥 Team Collaboration**: Multiple developers can work on database changes simultaneously
- **🔒 Data Safety**: Never lose data with automatic backups and version history

## 🛠️ Installing Guepard CLI

The Guepard CLI is your gateway to managing databases with Git-like workflows. Here's how to install it:

### **Option 1: Using Homebrew (Recommended)**

```bash
# Add Guepard tap
brew tap guepard-corp/guepard

# Install Guepard CLI
brew install guepard

# Verify installation
guepard --version
```

## 🔐 Authenticating with Guepard

Before using Guepard CLI, you need to authenticate with your Guepard account:

```bash
# Interactive authentication (recommended)
guepard login
```

**Follow these steps:**
1. Run `guepard login`
2. Open the provided URL in your browser
3. Complete authentication in the browser
4. Enter the verification code in the terminal

```bash
# Direct token authentication (for CI/CD)
guepard login --code your-access-token-here
```

## 🚀 Getting Started with Guepard

### **Step 1: Create Your First Deployment**

```bash
# Interactive deployment setup
guepard deploy --interactive
```

This will guide you through:
- Choosing your database provider (PostgreSQL, MySQL, MongoDB)
- Selecting your region and cloud provider
- Setting up your repository name
- Configuring your database password

### **Step 2: Explore Your Deployment**

```bash
# List all your deployments
guepard list deployments

# View deployment details
guepard deploy --deployment-id YOUR_DEPLOYMENT_ID
```

### **Step 3: Create Your First Branch**

```bash
# List available branches
guepard branch --deployment-id YOUR_DEPLOYMENT_ID

# Create a new feature branch
guepard branch \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --snapshot-id YOUR_SNAPSHOT_ID \
  --name my-feature \
  --checkout \
  --ephemeral
```

## 🎯 GuepardStore Demo: See Guepard in Action

The GuepardStore Demo App is the perfect way to experience Guepard's capabilities. This e-commerce application demonstrates real-world scenarios where database versioning makes a difference.

### **What You'll Learn**

- **Database Branching**: Create feature branches for new functionality
- **Schema Evolution**: Add new columns and tables safely
- **Data Migration**: Move data between database versions
- **Time Travel**: Roll back to previous states
- **Team Collaboration**: Multiple developers working on database changes

### **Demo Scenarios**

1. **Feature Development**: Add a discount system to your e-commerce app
2. **A/B Testing**: Test different database schemas simultaneously
3. **Rollback Scenarios**: Quickly revert problematic changes
4. **Data Recovery**: Restore data from any point in time

## 🐆 Essential Guepard CLI Commands

### **Database Management**

```bash
# List deployments
guepard list deployments

# Create new deployment
guepard deploy --interactive

# View deployment details
guepard deploy --deployment-id DEPLOYMENT_ID
```

### **Branching and Versioning**

```bash
# List branches
guepard branch --deployment-id DEPLOYMENT_ID

# Create new branch
guepard branch \
  --deployment-id DEPLOYMENT_ID \
  --snapshot-id SNAPSHOT_ID \
  --name branch-name \
  --checkout

# Switch branches
guepard checkout \
  --deployment-id DEPLOYMENT_ID \
  --branch-id BRANCH_ID
```

### **Snapshots and Time Travel**

```bash
# Create snapshot
guepard commit \
  --message "Add user authentication" \
  --deployment-id DEPLOYMENT_ID \
  --branch-id BRANCH_ID

# List commits/snapshots
guepard list commits --deployment-id DEPLOYMENT_ID --graph

# Time travel to snapshot
guepard checkout \
  --deployment-id DEPLOYMENT_ID \
  --snapshot-id SNAPSHOT_ID
```

### **Monitoring and Logs**

```bash
# View deployment logs
guepard log --deployment-id DEPLOYMENT_ID --follow

# Check compute status
guepard compute status --deployment-id DEPLOYMENT_ID

# View usage and quotas
guepard usage
```

## 🎬 Running the GuepardStore Demo

### **Quick Start**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/guepardstore-demo
   cd guepardstore-demo
   ```

2. **Set up your Guepard deployment**:
   ```bash
   guepard deploy --interactive
   ```

3. **Configure the application**:
   ```bash
   # Copy environment files
   cp components/api/.env.example components/api/.env
   cp components/frontend/.env.example components/frontend/.env
   
   # Add your Guepard database URL to components/api/.env
   ```

4. **Install dependencies and start**:
   ```bash
   # Install dependencies
   cd components/api && bun install && cd ../..
   cd components/frontend && bun install && cd ../..
   
   # Start the application
   cd components/api && bun run dev &
   cd components/frontend && bun run dev &
   ```

5. **Access the demo**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

### **Demo Workflow**

#### **Method 1: Using the Demo Control Panel (Recommended)**

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

#### **Method 2: Using Git Branch Checkout + Database Branch Management**

This method uses Git branches for code changes and either CLI or dashboard for database branch management.

##### **Switching to Discount Feature**

1. **Switch to discount feature Git branch**:
   ```bash
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

##### **Switching Back to Main**

1. **Switch back to main Git branch**:
   ```bash
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

### **Complete Demo Workflow**

#### **Phase 1: Initial Setup**
```bash
# Create initial snapshot
guepard commit \
  --message "Initial application state" \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --branch-id YOUR_BRANCH_ID
```

#### **Phase 2: Feature Development**
```bash
# Create feature branch
guepard branch \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --snapshot-id YOUR_SNAPSHOT_ID \
  --name discount-feature \
  --checkout \
  --ephemeral

# Switch to feature code branch
git checkout discout-feature
```

#### **Phase 3: Testing and Validation**
```bash
# Create snapshot with feature
guepard commit \
  --message "Added discount feature" \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --branch-id YOUR_BRANCH_ID
```

#### **Phase 4: Time Travel Demo**
```bash
# Travel back to initial state
guepard checkout \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --snapshot-id INITIAL_SNAPSHOT_ID

# See the difference!
```

#### **Phase 5: Rollback**
```bash
# Switch back to main branch
guepard checkout \
  --deployment-id YOUR_DEPLOYMENT_ID \
  --branch-id MAIN_BRANCH_ID

# Switch back to main code branch
git checkout main
```


## 📚 Learn More

- **Guepard Documentation**: [docs.guepard.run](https://docs.guepard.run)
- **CLI Reference**: [CLI Commands](https://docs.guepard.run/cli-commands)
- **API Documentation**: [API Reference](https://docs.guepard.run/api)
- **Community**: [Discord](https://discord.gg/guepard)

## 🛠️ Application Details

For detailed information about the GuepardStore application itself, including:
- Technical architecture
- Setup instructions
- API documentation
- Docker deployment
- Troubleshooting

See: [APPLICATION_README.md](./APPLICATION_README.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- **Documentation**: [docs.guepard.run](https://docs.guepard.run)
- **Community**: [Discord](https://discord.gg/guepard)
- **Issues**: [GitHub Issues](https://github.com/Guepard-Corp/guepard-cli/issues)
- **Email**: support@guepard.run

---

**🐆 Start your Git-like database journey with Guepard today!**