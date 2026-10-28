# Ứng dụng Quản lý Sách - 235221_TranToanPhat

## I. Giới thiệu đề tài
Ứng dụng web full-stack quản lý danh mục sách, hỗ trợ các chức năng thêm, sửa, xóa, tìm kiếm và thống kê sách phục vụ công tác quản lý thư viện.

## II. Công nghệ sử dụng
* **Frontend:** ReactJS (Vite), Tailwind CSS / Bootstrap.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas.
* **Containerization:** Docker & Docker Hub.
* **Deployment:** Render PaaS.

## III. Cấu trúc dự án
* `backend/`: API Server xử lý logic nghiệp vụ và kết nối database.
* `frontend/`: Giao diện người dùng tương tác với API.

## IV. Hướng dẫn cài đặt và chạy chương trình
1. Clone repository về máy:
   ```bash
   git clone [https://github.com/username/235221_TranToanPhat.git](https://github.com/username/235221_TranToanPhat.git)
   cd 235221_TranToanPhat
   ```
2. Cấu hình MongoDB Atlas:
   ```bash
   cd backend
   copy .env.example .env
   ```
   Điền `MONGO_URI` trong `.env` bằng connection string của MongoDB Atlas.
3. Cài đặt và chạy backend:
   ```bash
   npm install
   npm start
   ```

## VI. Triển khai trên Render

Repository đã có [render.yaml](./render.yaml) để tạo backend và frontend từ Docker.
Có thể chọn **New > Blueprint** trên Render và trỏ tới repository này. Nếu tạo
backend thủ công, dùng các giá trị sau:

- **Language:** Docker
- **Root Directory:** `backend`
- **Dockerfile Path:** `./Dockerfile`
- **Health Check Path:** `/health`
- **Environment Variables:**
  - `PORT=10000` (Render tự cấp port; ứng dụng cũng hỗ trợ port động)
  - `MONGO_URI=<MongoDB Atlas connection string>`
  - `MONGO_DB_NAME=235221_TranToanPhat`
  - `FRONTEND_URL=<URL frontend Render>`

Sau khi backend deploy thành công, kiểm tra:
`https://<backend-service>.onrender.com/health`.
Khi tạo frontend, đặt `VITE_API_URL` bằng
`https://<backend-service>.onrender.com/api` trước khi build image.

Không commit `.env` hoặc đặt `MONGO_URI` trong Dockerfile. Hãy nhập secret ở
Environment Variables của Render. Nếu credential MongoDB đã từng bị công khai,
cần đổi password user trên MongoDB Atlas và cập nhật lại biến `MONGO_URI`.

### Checklist kiểm tra sau khi deploy

1. Backend trả về `{"status":"ok"}` tại `/health`.
2. `GET /api/books` trả về HTTP 200.
3. Frontend được build với `VITE_API_URL` trỏ đến backend Render, không phải
   `localhost`.
4. `FRONTEND_URL` của backend khớp origin frontend Render, ví dụ:
   `https://235221-trantoanphat-frontend.onrender.com`.
5. MongoDB Atlas đã cho phép kết nối từ Render trong **Network Access**
   (có thể dùng `0.0.0.0/0` cho bài tập, nhưng nên giới hạn IP trong môi trường
   production).
6. Kiểm tra lần lượt thêm, xem chi tiết, tìm kiếm, cập nhật và xóa sách từ
   giao diện public.

Nếu backend báo `MongoServerError: bad auth`, kiểm tra lại username/password
và URL-encode ký tự đặc biệt trong password. Nếu báo timeout kết nối, kiểm tra
MongoDB Atlas Network Access.

## V. Backend API

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái backend |
| GET | `/api/books` | Lấy danh sách sách |
| GET | `/api/books/:id` | Xem một sách |
| POST | `/api/books` | Thêm sách mới |
| PUT | `/api/books/:id` | Cập nhật sách |
| DELETE | `/api/books/:id` | Xóa sách |
| GET | `/api/books?search=keyword` | Tìm theo tên sách, tác giả hoặc thể loại |

Body của `POST`/`PUT` là JSON gồm các trường `bookId`, `title`, `author`,
`category`, `publisher`, `publishYear`, `isbn`, `quantity` và tùy chọn `description`.
`bookId` phải là duy nhất; dữ liệu không hợp lệ trả về HTTP 400, bản ghi không tồn tại
trả về HTTP 404 và lỗi trùng `bookId` trả về HTTP 409.