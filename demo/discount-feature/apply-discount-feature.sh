#!/bin/bash
echo "🚀 Applying discount feature patch..."

# Define source and destination paths
PATCH_DIR="demo/discount-feature"

SCHEMA_ORIGINAL="components/api/prisma/schema.prisma"
PRODUCT_CARD_ORIGINAL="components/frontend/src/components/ProductCard.tsx"
PRODUCT_FORM_ORIGINAL="components/frontend/src/components/ProductForm.tsx"
PRODUCT_TYPE_ORIGINAL="components/frontend/src/types/types.ts"
ADMIN_PAGE_ORIGINAL="components/frontend/src/pages/Admin.tsx"
PRODUCT_ROUTES_ORIGINAL="components/api/src/routes/productRoutes.ts"
API_ORIGINAL="components/frontend/src/services/api.ts"

# 1. Back up original files
echo "   - Backing up original files..."
cp "$SCHEMA_ORIGINAL" "$SCHEMA_ORIGINAL.bak"
cp "$PRODUCT_CARD_ORIGINAL" "$PRODUCT_CARD_ORIGINAL.bak"
cp "$PRODUCT_FORM_ORIGINAL" "$PRODUCT_FORM_ORIGINAL.bak"
cp "$ADMIN_PAGE_ORIGINAL" "$ADMIN_PAGE_ORIGINAL.bak"
cp "$PRODUCT_TYPE_ORIGINAL" "$PRODUCT_TYPE_ORIGINAL.bak"
cp "$PRODUCT_ROUTES_ORIGINAL" "$PRODUCT_ROUTES_ORIGINAL.bak"
cp "$API_ORIGINAL" "$API_ORIGINAL.bak"

# 2. Copy new files from the patch directory
echo "   - Applying new feature files..."
cp "$PATCH_DIR/api/prisma/schema.prisma" "$SCHEMA_ORIGINAL"
cp "$PATCH_DIR/frontend/src/components/ProductCard.tsx" "$PRODUCT_CARD_ORIGINAL"
cp "$PATCH_DIR/frontend/src/types/types.ts" "$PRODUCT_TYPE_ORIGINAL"
cp "$PATCH_DIR/frontend/src/pages/Admin.tsx" "$ADMIN_PAGE_ORIGINAL"
cp "$PATCH_DIR/frontend/src/components/ProductForm.tsx" "$PRODUCT_FORM_ORIGINAL"
cp "$PATCH_DIR/frontend/src/services/api.ts" "$API_ORIGINAL"
cp "$PATCH_DIR/api/src/routes/productRoutes.ts" "$PRODUCT_ROUTES_ORIGINAL"

echo "✅ Feature patch applied successfully!"
echo "Next steps:"
echo "  1. Switch to your feature database branch in Guepard."
echo "  2. Run 'bunx prisma migrate dev' in the 'components/api' directory."
echo "  3. Restart both backend and frontend servers."
