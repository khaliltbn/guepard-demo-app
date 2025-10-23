import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

interface OrderRequestBody {
  clientInfo: {
    name: string;
    phone: string;
    address: string;
  };
  cartItems: Array<{
    id: string; 
    quantity: number;
    price: number;
  }>;
}

router.post('/', async (req, res) => {
  const { clientInfo, cartItems }: OrderRequestBody = req.body;

  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product?.name || 'Unknown'}`);
        }
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order = await tx.order.create({
        data: {
          clientName: clientInfo.name,
          clientPhone: clientInfo.phone,
          clientAddress: clientInfo.address,
          totalAmount: totalAmount,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              priceAtTime: item.price,
            })),
          },
        },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error("Order creation failed:", error);
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

export default router;