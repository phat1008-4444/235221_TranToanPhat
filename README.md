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