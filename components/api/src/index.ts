import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import demoControlRoutes from './routes/demoControlRoutes';

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0'; 

const allowedOrigins = [// Vite default ports
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.FRONTEND_URL || 'http://localhost:8080'
];

/*app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
  }
}));*/

app.use(cors());

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/demo-control', demoControlRoutes);

app.listen(Number(port), host, () => {
  console.log(`🐆 Guepard Demo API is running on http://localhost:${port}`);
});