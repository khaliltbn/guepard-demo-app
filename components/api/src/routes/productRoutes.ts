import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  const { q, category } = req.query; 

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: q ? [
          { name: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
        ] : undefined,
        category: category ? {
          slug: category as string
        } : undefined
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create a new product (handles discountPrice)
router.post('/', async (req, res) => {
  try {
    // 👇 Destructure discountPrice from the body
    const { name, description, price, stock, imageUrl, categoryId, discountPrice } = req.body;

    // Helper to parse discount price (returns null if invalid or undefined)
    const parseDiscount = (value: any): number | null => {
      if (value === undefined || value === null || value === '') return null;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 ? num : null;
    };

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price), // Assuming price is required and sent as string/number
        discountPrice: parseDiscount(discountPrice), // 👇 Use parsed discount price
        stock: parseInt(stock), // Assuming stock is required and sent as string/number
        imageUrl,
        categoryId,
      },
      include: { category: true } // Include category in response
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update an existing product (handles discountPrice)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 👇 Destructure discountPrice from the body
    const { name, description, price, stock, imageUrl, categoryId, discountPrice } = req.body;

    // Helper (can be shared or defined locally)
    const parseDiscount = (value: any): number | null => {
      if (value === undefined || value === null || value === '') return null;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 ? num : null;
    };

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        discountPrice: parseDiscount(discountPrice), // 👇 Use parsed discount price
        stock: parseInt(stock),
        imageUrl,
        categoryId,
      },
       include: { category: true } // Include category in response
    });
    res.json(updatedProduct);
  } catch (error) {
     res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;