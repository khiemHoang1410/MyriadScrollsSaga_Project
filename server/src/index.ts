// server/src/index.ts
import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';

// Kích hoạt dotenv để đọc file .env từ thư mục server/
dotenv.config();

const app: Application = express();
// Đọc PORT từ file .env, nếu không có thì mặc định là 8000
const port: number = parseInt(process.env.PORT as string, 10) || 8000;

// Middleware cơ bản để parse JSON request bodies (mình sẽ cần sớm thôi)
app.use(express.json());
// Middleware để parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Myriad Scrolls Saga Backend! 📜 (Correctly structured and ready!)');
});

app.listen(port, () => {
  // Thêm http://localhost:${port} để dễ click
  console.log(`✅ Backend server is rockin' and rollin' on port ${port} at http://localhost:${port} 🔥`);
});