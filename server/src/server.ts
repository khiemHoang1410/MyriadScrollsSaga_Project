// server/src/server.ts
import dotenv from 'dotenv';
dotenv.config(); 

import app from './app'; 
import { logger } from '@/config'; 

const port: number = parseInt(process.env.PORT as string, 10) || 8000;
const host: string = process.env.HOST || 'localhost';

// Thêm '0.0.0.0' để server lắng nghe từ mọi địa chỉ IP
app.listen(port, '0.0.0.0', () => {
  logger.info(`Backend server is rockin' and rollin' on port ${port} at http://localhost:${port}`);
  logger.info(`Current NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Log level: ${logger.level}`);
});