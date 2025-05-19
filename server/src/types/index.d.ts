// server/src/types/index.d.ts
// (Nếu file này chưa tồn tại, hãy tạo nó)

// Import kiểu gốc từ http để mở rộng
import 'http';

declare module 'http' {
  interface ServerResponse {
    /**
     * Thời gian phản hồi (tính bằng mili giây) được thêm bởi pino-http.
     */
    responseTime?: number;
  }
}

// Nếu "bro" dùng Express, và pino-http mở rộng trực tiếp kiểu Response của Express:
// (Mặc dù pino-http thường làm việc với http.ServerResponse gốc)
// declare global {
//   namespace Express {
//     export interface Response {
//       responseTime?: number;
//     }
//   }
// }