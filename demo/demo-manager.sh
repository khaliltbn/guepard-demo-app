#!/bin/bash

# --- Guepard Demo Manager ---
# Applies/reverts feature patch files or updates DB connection strings in .env.
# Assumes script is run from the 'demo/' directory.
#
# USAGE:
#   ./demo-manager.sh apply <feature_name>
#   ./demo-manager.sh revert <feature_name>
#   ./demo-manager.sh switch-db <main_connection_string> [shadow_connection_string]
# -----------------------------

# --- 1. CONFIGURATION & FILE PATHS ---
ACTION=$1
ARGUMENT1=$2 # Feature name OR Main Connection string
ARGUMENT2=$3 # Shadow Connection string (optional, for switch-db)

# Paths relative to the 'demo/' directory (where this script lives)
API_DIR="../components/api"
FRONTEND_DIR="../components/frontend"
SCHEMA_ORIGINAL="$API_DIR/prisma/schema.prisma"
PRODUCT_CARD_ORIGINAL="$FRONTEND_DIR/src/components/ProductCard.tsx"
PRODUCT_FORM_ORIGINAL="$FRONTEND_DIR/src/components/ProductForm.tsx" # Added
ADMIN_PAGE_ORIGINAL="$FRONTEND_DIR/src/pages/Admin.tsx" # Added
PRODUCT_TYPE_ORIGINAL="$FRONTEND_DIR/src/types/types.ts" # Check path validity (maybe product.ts?)
API_ORIGINAL="$FRONTEND_DIR/src/services/api.ts"
PRODUCT_ROUTES_ORIGINAL="$API_DIR/src/routes/productRoutes.ts"
ENV_FILE="$API_DIR/.env"
MARKER_FILE="$API_DIR/feature_applied"

# --- 2. HELPER FUNCTIONS ---

# Function to display error messages to stderr and exit
error_exit() {
  echo "❌ Error: $1" >&2
  exit 1
}

# Function to back up original files
backup_files() {
  echo "   - Backing up original files..."
  cp "$SCHEMA_ORIGINAL" "$SCHEMA_ORIGINAL.bak" || error_exit "Failed to back up schema."
  cp "$PRODUCT_CARD_ORIGINAL" "$PRODUCT_CARD_ORIGINAL.bak" || error_exit "Failed to back up ProductCard."
  cp "$PRODUCT_FORM_ORIGINAL" "$PRODUCT_FORM_ORIGINAL.bak" || error_exit "Failed to back up ProductForm." # Added
  cp "$ADMIN_PAGE_ORIGINAL" "$ADMIN_PAGE_ORIGINAL.bak" || error_exit "Failed to back up Admin page." # Added
  cp "$PRODUCT_TYPE_ORIGINAL" "$PRODUCT_TYPE_ORIGINAL.bak" || error_exit "Failed to back up types file."
  cp "$API_ORIGINAL" "$API_ORIGINAL.bak" || error_exit "Failed to back up api service."
  cp "$PRODUCT_ROUTES_ORIGINAL" "$PRODUCT_ROUTES_ORIGINAL.bak" || error_exit "Failed to back productRoutes."
}

# Function to apply patch files
apply_patch_files() {
  local feature_name=$1
  local patch_dir=$feature_name # Patch dir is relative to 'demo/'

  echo "   - Applying new feature files from '$patch_dir'..."
  # Check if patch files exist before copying
  [ ! -f "$patch_dir/api/prisma/schema.prisma" ] && error_exit "Missing schema patch file in $patch_dir."
  cp "$patch_dir/api/prisma/schema.prisma" "$SCHEMA_ORIGINAL" || error_exit "Failed to copy schema patch."

  [ ! -f "$patch_dir/frontend/src/components/ProductCard.tsx" ] && error_exit "Missing ProductCard patch file in $patch_dir."
  cp "$patch_dir/frontend/src/components/ProductCard.tsx" "$PRODUCT_CARD_ORIGINAL" || error_exit "Failed to copy ProductCard patch."

  [ ! -f "$patch_dir/frontend/src/components/ProductForm.tsx" ] && error_exit "Missing ProductForm patch file in $patch_dir."
  cp "$patch_dir/frontend/src/components/ProductForm.tsx" "$PRODUCT_FORM_ORIGINAL" || error_exit "Failed to copy ProductForm patch." # Added

  [ ! -f "$patch_dir/frontend/src/pages/Admin.tsx" ] && error_exit "Missing Admin page patch file in $patch_dir."
  cp "$patch_dir/frontend/src/pages/Admin.tsx" "$ADMIN_PAGE_ORIGINAL" || error_exit "Failed to copy Admin page patch." # Added

  [ ! -f "$patch_dir/frontend/src/types/types.ts" ] && error_exit "Missing types patch file in $patch_dir."
  cp "$patch_dir/frontend/src/types/types.ts" "$PRODUCT_TYPE_ORIGINAL" || error_exit "Failed to copy types patch."

  [ ! -f "$patch_dir/frontend/src/services/api.ts" ] && error_exit "Missing api service patch file in $patch_dir."
  cp "$patch_dir/frontend/src/services/api.ts" "$API_ORIGINAL" || error_exit "Failed to copy api service patch."

  [ ! -f "$patch_dir/api/src/routes/productRoutes.ts" ] && error_exit "Missing api service patch file in $patch_dir."
  cp "$patch_dir/api/src/routes/productRoutes.ts" "$PRODUCT_ROUTES_ORIGINAL" || error_exit "Failed to copy api service patch."
}

# Function to restore original files from backup
restore_files() {
  echo "   - Restoring original files..."
  mv "$SCHEMA_ORIGINAL.bak" "$SCHEMA_ORIGINAL" || error_exit "Failed to restore schema."
  mv "$PRODUCT_CARD_ORIGINAL.bak" "$PRODUCT_CARD_ORIGINAL" || error_exit "Failed to restore ProductCard."
  mv "$PRODUCT_FORM_ORIGINAL.bak" "$PRODUCT_FORM_ORIGINAL" || error_exit "Failed to restore ProductForm." # Added
  mv "$ADMIN_PAGE_ORIGINAL.bak" "$ADMIN_PAGE_ORIGINAL" || error_exit "Failed to restore Admin page." # Added
  mv "$PRODUCT_TYPE_ORIGINAL.bak" "$PRODUCT_TYPE_ORIGINAL" || error_exit "Failed to restore types file."
  mv "$PRODUCT_ROUTES_ORIGINAL.bak" "$PRODUCT_ROUTES_ORIGINAL" || error_exit "Failed to restore productRoutes."
  mv "$API_ORIGINAL.bak" "$API_ORIGINAL" || error_exit "Failed to restore api service."
}

# Function to regenerate Prisma client
generate_prisma() {
  echo "   - Regenerating Prisma Client..."
  (cd "$API_DIR" && bunx prisma generate) || error_exit "Prisma generate failed."
}

# Function to update BOTH DATABASE_URL and SHADOW_DATABASE_URL in .env
update_env() {
    local main_conn=$1
    local shadow_conn=$2
    local temp_file="$ENV_FILE.tmp"
    local updated_main=false
    local updated_shadow=false

    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        error_exit ".env file not found at $ENV_FILE"
    fi

    # Read line by line and replace or append
    >"$temp_file" # Create empty temp file
    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in
            DATABASE_URL=*)
                echo "DATABASE_URL=\"$main_conn\"" >> "$temp_file"
                updated_main=true
                ;;
            SHADOW_DATABASE_URL=*)
                # Only update shadow if provided
                if [ -n "$shadow_conn" ]; then
                    echo "SHADOW_DATABASE_URL=\"$shadow_conn\"" >> "$temp_file"
                    updated_shadow=true
                else
                    # If shadow_conn is empty, effectively remove the line by not writing it
                    # Or keep it if you prefer: echo "$line" >> "$temp_file"
                    : # Do nothing to remove it
                fi
                ;;
            *)
                echo "$line" >> "$temp_file"
                ;;
        esac
    done < "$ENV_FILE"

    # Append if variables were not found
    if ! $updated_main; then
        echo "" >> "$temp_file" # Add newline for clarity if appending
        echo "DATABASE_URL=\"$main_conn\"" >> "$temp_file"
    fi
    if ! $updated_shadow && [ -n "$shadow_conn" ]; then
        echo "" >> "$temp_file" # Add newline for clarity if appending
        echo "SHADOW_DATABASE_URL=\"$shadow_conn\"" >> "$temp_file"
    fi

    # Replace original file
    mv "$temp_file" "$ENV_FILE" || error_exit "Failed to replace .env file."
}


# --- 3. VALIDATE ACTION & ARGUMENT ---
if [ -z "$ACTION" ]; then error_exit "Missing action. Usage: $0 <apply|revert|switch-db> <argument>"; fi
# Argument validation specific to actions happens inside the blocks

# --- 4. EXECUTE THE ACTION using case statement ---

case "$ACTION" in
  apply)
    FEATURE_NAME=$ARGUMENT1
    if [ -z "$FEATURE_NAME" ]; then error_exit "Missing <feature_name> for 'apply'."; fi
    PATCH_DIR=$FEATURE_NAME # Relative to 'demo/'

    if [ ! -d "$PATCH_DIR" ]; then error_exit "Patch directory '$PATCH_DIR' not found."; fi
    if [ -f "$SCHEMA_ORIGINAL.bak" ]; then error_exit "Patch already applied? Backups exist."; fi

    echo "🚀 Applying '$FEATURE_NAME' patch files..."
    backup_files
    apply_patch_files "$FEATURE_NAME"
    generate_prisma
    echo "✅ File patch applied successfully!"
    #touch "$MARKER_FILE" || error_exit "Failed to create marker file."

     echo "   - Attempting to create marker file at $MARKER_FILE..."
    # Attempt to create the file
    touch "$MARKER_FILE"

    # Verify if the file was created
    if [ -f "$MARKER_FILE" ]; then
        echo "   ✅ Created marker file: $MARKER_FILE"
    fi
    echo "----------------------------------------"
    echo "🔴 NEXT STEPS (Manual):"
    echo "  1. STOP both Backend and Frontend servers."
    echo "  2. In Guepard: Switch ACTIVE branch to '$FEATURE_NAME'."
    echo "  3. In Backend terminal ('$API_DIR'): Run 'bunx prisma migrate deploy'."
    echo "  4. Restart BOTH servers ('bun run dev')."
    ;;

  revert)
    FEATURE_NAME=$ARGUMENT1
    if [ -z "$FEATURE_NAME" ]; then error_exit "Missing <feature_name> for 'revert'."; fi
    echo "⏪ Reverting '$FEATURE_NAME' patch files..."

    # Check for all expected backup files
    if [ ! -f "$SCHEMA_ORIGINAL.bak" ] || \
       [ ! -f "$PRODUCT_CARD_ORIGINAL.bak" ] || \
       [ ! -f "$PRODUCT_FORM_ORIGINAL.bak" ] || \
       [ ! -f "$ADMIN_PAGE_ORIGINAL.bak" ] || \
       [ ! -f "$PRODUCT_TYPE_ORIGINAL.bak" ] || \
       [ ! -f "$PRODUCT_ROUTES_ORIGINAL.bak" ] || \
       [ ! -f "$API_ORIGINAL.bak" ]; then
      error_exit "No patch to revert. Some backup files not found."
    fi

    restore_files
    generate_prisma
    echo "✅ File rollback successful!"
    rm -f "$MARKER_FILE" || error_exit "Failed to remove marker file."
    echo "   - Removed marker file: $MARKER_FILE"
    echo "----------------------------------------"
    echo "🔴 NEXT STEPS (Manual):"
    echo "  1. STOP both Backend and Frontend servers."
    echo "  2. In Guepard: Switch ACTIVE branch back to 'main'."
    echo "  3. Restart BOTH servers ('bun run dev')."
    ;;

  switch-db)
    MAIN_CONN_STRING=$ARGUMENT1
    SHADOW_CONN_STRING=$ARGUMENT2 # Can be empty
    if [ -z "$MAIN_CONN_STRING" ]; then error_exit "Missing <main_connection_string> for 'switch-db'."; fi

    echo "🔄 Updating database connection strings in $ENV_FILE..."
    update_env "$MAIN_CONN_STRING" "$SHADOW_CONN_STRING" # Call helper to update/append both
    echo "✅ .env updated successfully!"
    echo "----------------------------------------"
    echo "🔴 NEXT STEPS (Manual):"
    echo "  1. STOP the Backend server."
    echo "  2. Restart the Backend server ('bun run dev')."
    ;;

  *)
    error_exit "Invalid action '$ACTION'. Use 'apply', 'revert', or 'switch-db'."
    ;;
esac

exit 0 # Signal success