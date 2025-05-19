// server/src/app.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv'; // Đảm bảo dotenv được gọi sớm nếu chưa có ở đâu khác
dotenv.config(); // Gọi ở đây hoặc ở server.ts trước khi import app

import { connectDB, httpLogger, logger } from '@/config'; // Sử dụng barrel file
import { errorHandler, validateResource } from '@/middleware'; // Sử dụng barrel file

// Import routes (ví dụ, sau này sẽ chuyển vào modules)
import authRoutes from '@/routes/authRoutes'; // Hiện tại vẫn giữ đường dẫn này
import adminRoutes from '@/routes/adminRoutes'; // Hiện tại vẫn giữ đường dẫn này
// import bookRoutes from '@/modules/book/book.route'; // Ví dụ khi có module book

const app: Application = express();

// Kết nối tới MongoDB
connectDB();

// Sử dụng Pino HTTP logger trước tất cả các route và middleware khác
app.use(httpLogger);

// Middlewares để parse JSON và URL-encoded data từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/books', bookRoutes); // Ví dụ khi có module book

// Route test cơ bản
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Myriad Scrolls Saga Backend App! 📜 (DB Connection Attempted!)');
});

// Global error handler (phải đặt SAU tất cả các routes và middlewares khác)
app.use(errorHandler);

export default app;