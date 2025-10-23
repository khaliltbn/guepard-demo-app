#!/bin/bash
echo "⏪ Rolling back discount feature patch..."

# Define original file paths
SCHEMA_ORIGINAL="components/api/prisma/schema.prisma"
PRODUCT_CARD_ORIGINAL="components/frontend/src/components/ProductCard.tsx"
PRODUCT_TYPE_ORIGINAL="components/frontend/src/types/types.ts"
API_ORIGINAL="components/frontend/src/services/api.ts"
PRODUCT_FORM_ORIGINAL="components/frontend/src/components/ProductForm.tsx"
ADMIN_PAGE_ORIGINAL="components/frontend/src/pages/Admin.tsx"
PRODUCT_ROUTES_ORIGINAL="components/api/src/routes/productRoutes.ts"


# Check if backups exist
if [ -f "$SCHEMA_ORIGINAL.bak" ] && [ -f "$PRODUCT_CARD_ORIGINAL.bak" ] && [ -f "$PRODUCT_TYPE_ORIGINAL.bak" ] && [ -f "$API_ORIGINAL.bak" ] || [ ! -f "$PRODUCT_FORM_ORIGINAL.bak" ] || [ ! -f "$ADMIN_PAGE_ORIGINAL.bak" ] || [ ! -f "$PRODUCT_ROUTES_ORIGINAL.bak" ]; then
  # 1. Restore from backups
  echo "   - Restoring original files..."
  mv "$SCHEMA_ORIGINAL.bak" "$SCHEMA_ORIGINAL"
  mv "$PRODUCT_CARD_ORIGINAL.bak" "$PRODUCT_CARD_ORIGINAL"
  mv "$PRODUCT_TYPE_ORIGINAL.bak" "$PRODUCT_TYPE_ORIGINAL"
  mv "$ADMIN_PAGE_ORIGINAL.bak" "$ADMIN_PAGE_ORIGINAL"
  mv "$PRODUCT_FORM_ORIGINAL.bak" "$PRODUCT_FORM_ORIGINAL"
  mv "$PRODUCT_ROUTES_ORIGINAL.bak" "$PRODUCT_ROUTES_ORIGINAL"
  mv "$API_ORIGINAL.bak" "$API_ORIGINAL"
  echo "✅ Rollback successful!"
else
  echo "❌ No backup files found. Cannot roll back."
  exit 1
fi

echo "🔄 Please restart both backend and frontend servers to apply the changes."
