# 📖 Myriad Scrolls Saga

<div align="center">
  <br/><br/>
  <p>
    <strong>Một nền tảng kể chuyện tương tác thế hệ mới, nơi mỗi lựa chọn của bạn sẽ viết nên một cuộc phiêu lưu độc nhất.</strong>
  </p>
</div>

## 🌟 Giới Thiệu Dự Án

**Myriad Scrolls Saga** không chỉ là một trang web đọc truyện. Đây là một thế giới mở, nơi các tác giả có thể tự tay tạo ra những câu chuyện phi tuyến tính phức tạp, với các biến số, điều kiện và nhiều kết thúc khác nhau. Người đọc sẽ không chỉ đọc, mà còn thực sự "sống" trong câu chuyện, đưa ra những lựa chọn định mệnh để khám phá những con đường và kết cục mà chỉ họ mới có thể mở ra.

Dự án này là một Full-stack Monorepo bao gồm:
* **Backend:** Một API server mạnh mẽ được xây dựng bằng Node.js và Express, quản lý toàn bộ logic truyện, người dùng và tiến trình chơi.
* **Frontend:** Một giao diện người dùng hiện đại, nhanh và mượt mà được xây dựng bằng React (Vite) và Material-UI, mang lại trải nghiệm đọc và tương tác tốt nhất.
* **Database:** Sử dụng MongoDB để lưu trữ linh hoạt các cấu trúc truyện phức tạp.

## ✨ Tính Năng Nổi Bật

* **Hệ Thống Tạo Truyện Động:** Tác giả có thể tạo các "nút" truyện (page node), mỗi nút chứa nội dung và các lựa chọn.
* **Lựa Chọn Dựa Trên Điều Kiện:** Các lựa chọn có thể hiện ra hoặc ẩn đi dựa trên các "biến số" mà người chơi đã tích lũy (ví dụ: có đủ điểm sức mạnh, đã gặp một nhân vật nào đó).
* **Quản Lý Trạng Thái Người Chơi:** Theo dõi tiến trình, các biến số và những kết thúc mà người chơi đã khám phá.
* **Nhiều Kiểu Layout:** Hỗ trợ cả layout kiểu "Adventure Log" (hiển thị thông số) và "Lite Novel" (tập trung vào nội dung).
* **Phân Quyền:** Hệ thống phân quyền cho Người dùng (User) và Quản trị viên (Admin).
* **API Documentation:** Tích hợp Swagger để dễ dàng theo dõi và thử nghiệm API.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

Đây là những công nghệ đã làm nên dự án này:

<h4>Backend</h4>
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="ExpressJS">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge" alt="Zod">
</p>

<h4>Frontend</h4>
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI">
  <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge" alt="Zustand">
  <img src="https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="React Query">
</p>

<h4>DevOps</h4>
<p>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render">
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint">
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier">
</p>


## 🚀 Bắt Đầu Nhanh (Getting Started)

Để chạy dự án này trên máy của bạn, hãy làm theo các bước sau.

### Yêu Cầu
* Node.js (phiên bản 18.x trở lên)
* npm hoặc yarn
* Một tài khoản MongoDB Atlas (hoặc MongoDB cài trên máy)

### Cài Đặt

1.  **Clone repo về máy:**
    ```bash
    git clone [https://github.com/khiemHoang1410/MyriadScrollsSaga_Project.git](https://github.com/khiemHoang1410/MyriadScrollsSaga_Project.git)
    cd MyriadScrollsSaga_Project
    ```

2.  **Cài đặt cho Backend:**
    ```bash
    cd server
    npm install
    ```

3.  **Cài đặt cho Frontend:**
    ```bash
    cd ../client
    npm install
    ```

### Thiết Lập Biến Môi Trường

Dự án cần một vài biến môi trường để có thể chạy.

1.  **Backend:**
    * Trong thư mục `server`, tạo một file `.env`.
    * Copy nội dung từ `.env.example` (nếu có) hoặc điền các giá trị sau:
        ```env
        PORT=8000
        MONGODB_URI=<Your_MongoDB_Connection_String>
        JWT_SECRET=<Your_Super_Secret_JWT_Key>
        JWT_ACCESS_TOKEN_EXPIRES_IN=7d
        CORS_ORIGIN=http://localhost:5173
        ```

2.  **Frontend:**
    * Trong thư mục `client`, tạo một file `.env.local`.
    * Điền giá trị sau:
        ```env
        VITE_API_BASE_URL=http://localhost:8000/api
        ```

### Chạy Dự Án

* **Chạy Backend (mở một terminal):**
    ```bash
    cd server
    npm run dev
    ```
    Server sẽ chạy tại `http://localhost:8000`.

* **Chạy Frontend (mở một terminal khác):**
    ```bash
    cd client
    npm run dev
    ```
    Truy cập `http://localhost:5173` trên trình duyệt để xem ứng dụng.

_Cảm ơn bạn đã ghé thăm dự án này!_
