import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding database...');

  // --- 1. Seed Categories ---
  // Using createMany and skipDuplicates to avoid errors on re-running the seed
  await prisma.category.createMany({
    data: [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel items' },
      { name: 'Books', slug: 'books', description: 'Physical and digital books' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and gardening products' },
    ],
    skipDuplicates: true, 
  });

  console.log('Categories seeded.');

  // --- 2. Get Created Categories to link Products ---
  // We need the UUIDs of the categories we just created to link the products correctly.
  const categories = await prisma.category.findMany();
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.slug] = category.id;
    return acc;
  }, {} as Record<string, string>);

  // --- 3. Seed Products ---
  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
        price: 199.99,
        stock: 45,
        categoryId: categoryMap['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      },
      {
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart rate monitor and GPS',
        price: 299.99,
        stock: 23,
        categoryId: categoryMap['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% organic cotton t-shirt in multiple colors',
        price: 29.99,
        stock: 150,
        categoryId: categoryMap['clothing'],
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      },
      {
        name: 'Programming Guide',
        description: 'Comprehensive guide to modern web development and best practices',
        price: 49.99,
        stock: 67,
        categoryId: categoryMap['books'],
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
      },
      {
        name: 'Garden Tool Set',
        description: 'Professional 10-piece garden tool set with ergonomic handles',
        price: 89.99,
        stock: 34,
        categoryId: categoryMap['home-garden'],
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      },
      {
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand for better ergonomics',
        price: 59.99,
        stock: 0,
        categoryId: categoryMap['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      },
    ],
    skipDuplicates: true, 
  });

  console.log('Products seeded.');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding finished.');
    await prisma.$disconnect();
  });