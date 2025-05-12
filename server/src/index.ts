// server/src/index.ts
import dotenv from 'dotenv';
dotenv.config(); 

import express, { Request, Response, Application } from 'express';
import connectDB from '@/config/db'; 
const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 8000;

// Kết nối tới MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Myriad Scrolls Saga Backend! 📜 (DB Connection Attempted!)');
});

app.listen(port, () => {
  console.log(`✅ Backend server is rockin' and rollin' on port 8000 at http\://localhost\:8000 🔥`);
});