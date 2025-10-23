## Applying the "Discount" Feature 🚀
This workflow simulates developing and deploying a new feature that requires both code and database schema changes.

### 1. Apply the Code Patch
First, run the automation script to update your source code with the new feature. This modifies the backend schema and frontend components.

Action: In your project's root terminal, run:

```Bash
./demo/discount-feature/apply-discount-feature.sh
```
### 2. Switch the Database Branch
Next, use the Guepard dashboard or CLI to switch your environment to the isolated feature branch.

Action: In Guepard, change your active database branch to feature-discounts.

### 3. Update the Backend
Now, apply the schema changes to the new database branch and restart the server.

Action: In your backend terminal (components/api):

Stop the server if it's running (Ctrl + C).

Run the database migration:

```bash
bunx prisma migrate dev --name "add-discounts"
```
If you have run this demo before on the same branch, the migration already exists. You only need to ensure your Prisma Client is in sync:

```Bash
bunx prisma generate
```

Restart the backend server:

```Bash
bun run dev
```

### 4. Restart the Frontend
Finally, restart the frontend development server to load the new component code.

Action: In your frontend terminal (components/frontend):

Stop the server (Ctrl + C).

Restart the server:

```Bash
bun run dev
```
### 5. Verify the Change
Action: Open your browser and navigate to the application. The product cards should now display the new discounted prices with a strikethrough on the original price.

## Rolling Back the "Discount" Feature ⏪
This workflow simulates a full rollback of both the application code and the database after a "bug" has been found.

### 1. Roll Back the Code
Run the rollback script to revert your source code to its original state.

Action: In your project's root terminal, run:

```Bash
./demo/discount-feature/rollback-discount-feature.sh
```
### 2. Switch the Database Branch
Use Guepard to switch your environment back to the stable, production database branch.

Action: In Guepard, change your active database branch back to main.

### 3. Update the Backend
Restart the backend server. A migration is not needed since you are reverting to a state the database already knows. The prisma generate command in the script ensures the client is in sync.

Action: In your backend terminal:

Stop the server (Ctrl + C).

Restart the server:

```Bash
bun run dev
```

### 4. Restart the Frontend
Restart the frontend server to load the original component code.

Action: In your frontend terminal:

Stop the server (Ctrl + C).

Restart the server:

```Bash
bun run dev
```

### 5. Verify the Rollback
Action: Refresh your browser. The application should now be back to its original state, with no discounts visible.