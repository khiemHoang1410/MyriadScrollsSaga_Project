// server/src/index.ts
import dotenv from 'dotenv';
dotenv.config(); 

import express, { Request, Response, Application } from 'express';
import connectDB from '@/config/db'; 
import authRoutes from '@/routes/authRoutes';
import adminRoutes from './routes/adminRoutes';


const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 8000;

// Kết nối tới MongoDB
connectDB();

// Middlewares để parse JSON và URL-encoded data từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // << THÊM DÒNG NÀY

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Myriad Scrolls Saga Backend! 📜 (DB Connection Attempted!)');
});

app.listen(port, () => {
  console.log(`✅ Backend server is rockin' and rollin' on port 8000 at http\://localhost\:8000 🔥`);
});