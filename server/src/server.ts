// server/src/server.ts
import dotenv from 'dotenv';
dotenv.config(); 

import app from './app'; 
import { logger } from '@/config'; 

const port: number = parseInt(process.env.PORT as string, 10) || 8000;
const host: string = process.env.HOST || 'localhost';

app.listen(port, host, () => {
  logger.info(`Backend server is rockin' and rollin' on port ${port} at http://${host}:${port}`);
  logger.info(`Current NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  logger.info(`Log level: ${process.env.LOG_LEVEL || 'info'}`);
});