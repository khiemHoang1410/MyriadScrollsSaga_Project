// server/src/app.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv'; // Đảm bảo dotenv được gọi sớm nếu chưa có ở đâu khác
dotenv.config(); // Gọi ở đây hoặc ở server.ts trước khi import app

import { connectDB, httpLogger, logger } from '@/config'; // Sử dụng barrel file
import { errorHandler, validateResource } from '@/middleware'; // Sử dụng barrel file

// Import routes 

import { genreModule, tagModule, languageModule,authModule, userModule, bookModule } from '@/modules';
import TempTestModel from '@/modules/tempTest/tempTest.model'; 


const app: Application = express();
connectDB();
app.use(httpLogger);

// Middlewares để parse JSON và URL-encoded data từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authModule.authRoutes); 
app.use('/api/users', userModule.userRoutes); 
app.use('/api/genres', genreModule.genreRoutes);
app.use('/api/genres', genreModule.genreRoutes);
app.use('/api/tags',tagModule.tagRoutes)
app.use('/api/languages', languageModule.languageRoutes);
app.use('/api/books', bookModule.bookRoutes); // << THÊM DÒNG NÀY


// Route test cơ bản
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Myriad Scrolls Saga Backend App! 📜 (DB Connection Attempted!)');
});

// Global error handler (phải đặt SAU tất cả các routes và middlewares khác)
app.use(errorHandler);

export default app;