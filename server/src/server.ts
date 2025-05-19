// server/src/server.ts
import dotenv from 'dotenv';
dotenv.config(); // Đảm bảo biến môi trường được load trước khi app được import

import app from './app'; // Import app đã được cấu hình
import { logger } from '@/config'; // Hoặc import logger trực tiếp nếu chỉ dùng ở đây

const port: number = parseInt(process.env.PORT as string, 10) || 8000;
const host: string = process.env.HOST || 'localhost'; // Thêm HOST nếu muốn tùy chỉnh

app.listen(port, host, () => {
  logger.info(`Backend server is rockin' and rollin' on port ${port} at http://${host}:${port}`);
  logger.info(`Current NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  logger.info(`Log level: ${process.env.LOG_LEVEL || 'info'}`);
});