import { useEffect, useState } from "react";
import { Product, Category } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: Partial<Product> & { category_id?: string; image_url?: string, discountPrice?: number | null }) => void; // Update onSubmit type
  onCancel: () => void;
}

export const ProductForm = ({ product, categories, onSubmit, onCancel }: ProductFormProps) => {
  // Add discountPrice to the initial state
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    discountPrice: product?.discountPrice?.toString() || "", // Add discountPrice
    stock: product?.stock?.toString() || "",
    category_id: product?.categoryId || "",
    image_url: product?.imageUrl || "",
  });

  // 👇 Add useEffect to update form when 'product' prop changes (for editing)
  useEffect(() => {
    setFormData({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price?.toString() || "",
        discountPrice: product?.discountPrice?.toString() || "", // Update on edit
        stock: product?.stock?.toString() || "",
        category_id: product?.categoryId || "",
        image_url: product?.imageUrl || "",
    });
  }, [product]); // Re-run effect if the product prop changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse discountPrice, defaulting to null if empty or invalid
    const discount = formData.discountPrice ? parseFloat(formData.discountPrice) : null;

    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      discountPrice: (discount !== null && !isNaN(discount) && discount >= 0) ? discount : null, // Ensure it's a valid non-negative number or null
      stock: parseInt(formData.stock),
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        {/* 👇 Added font-heading class */}
        <CardTitle className="font-heading">{product ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {product ? "Update product information" : "Create a new product in your catalog"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (TND)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">Discount Price (TND, Optional)</Label>
              <Input
                id="discountPrice" type="number" step="0.01" min="0"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                placeholder="e.g., 149.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {product ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};