-- Thêm cột 'role' vào bảng 'users' nếu chưa tồn tại
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role ENUM('admin', 'student') NOT NULL DEFAULT 'student' AFTER phone; 