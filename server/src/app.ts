// server/src/app.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv'; // Đảm bảo dotenv được gọi sớm nếu chưa có ở đâu khác
dotenv.config(); // Gọi ở đây hoặc ở server.ts trước khi import app
import { asyncHandler } from '@/utils'; // << Bro đã có cái này rồi

import { connectDB, httpLogger, logger } from '@/config'; // Sử dụng barrel file
import { errorHandler, validateResource } from '@/middleware'; // Sử dụng barrel file

// Import routes 
import authRoutes from '@/routes/authRoutes'; // Hiện tại vẫn giữ đường dẫn này
import adminRoutes from '@/routes/adminRoutes'; // Hiện tại vẫn giữ đường dẫn này

import { genreModule, tagModule, languageModule } from '@/modules';
import TempTestModel from '@/modules/tempTest/tempTest.model'; // << THÊM IMPORT NÀY (đường dẫn có thể cần điều chỉnh nếu bro đặt file ở chỗ khác)


const app: Application = express();
connectDB();
app.use(httpLogger);

// Middlewares để parse JSON và URL-encoded data từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/genres', genreModule.genreRoutes);
app.use('/api/tags',tagModule.tagRoutes)
app.use('/api/languages', languageModule.languageRoutes);


// Route test cơ bản
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Myriad Scrolls Saga Backend App! 📜 (DB Connection Attempted!)');
});

// Global error handler (phải đặt SAU tất cả các routes và middlewares khác)
app.use(errorHandler);

export default app;