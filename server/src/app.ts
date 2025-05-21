// server/src/app.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv'; // Đảm bảo dotenv được gọi sớm nếu chưa có ở đâu khác
dotenv.config(); // Gọi ở đây hoặc ở server.ts trước khi import app
import { asyncHandler } from '@/utils'; // << Bro đã có cái này rồi

import { connectDB, httpLogger, logger } from '@/config'; // Sử dụng barrel file
import { errorHandler, validateResource } from '@/middleware'; // Sử dụng barrel file

// Import routes (ví dụ, sau này sẽ chuyển vào modules)
import authRoutes from '@/routes/authRoutes'; // Hiện tại vẫn giữ đường dẫn này
import adminRoutes from '@/routes/adminRoutes'; // Hiện tại vẫn giữ đường dẫn này
// import bookRoutes from '@/modules/book/book.route'; // Ví dụ khi có module book
import { genreRoutes } from '@/modules/genre'; 
import { tagRoutes } from '@/modules/tag'; 

import TempTestModel from '@/modules/tempTest/tempTest.model'; // << THÊM IMPORT NÀY (đường dẫn có thể cần điều chỉnh nếu bro đặt file ở chỗ khác)

const app: Application = express();
connectDB();
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối tới MongoDB
app.post('/api/temp-test/create', asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('--- TEMP TEST ROUTE: Received request to create test document ---');
    const testName = req.body.testName || `Test ${Date.now()}`;
    
    console.log('--- TEMP TEST ROUTE: Calling TempTestModel.create with name:', testName);
    const newTestData = await TempTestModel.create({ testName });
    console.log('--- TEMP TEST ROUTE: TempTestModel.create SUCCEEDED ---', newTestData);
    
    res.status(201).json({
      message: 'TempTest document created successfully!',
      data: newTestData,
    });
  } catch (error: any) {
    console.error('--- TEMP TEST ROUTE: ERROR ---', error.message, error.stack);
    res.status(500).json({
      message: 'Error in temp-test route',
      error: error.message,
    });
  }
}));

// Middlewares để parse JSON và URL-encoded data từ request body

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/tags',tagRoutes)
// app.use('/api/books', bookRoutes); // Ví dụ khi có module book

// Route test cơ bản
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Myriad Scrolls Saga Backend App! 📜 (DB Connection Attempted!)');
});

// Global error handler (phải đặt SAU tất cả các routes và middlewares khác)
app.use(errorHandler);

export default app;