-- Tạo bảng payments nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_type ENUM('room', 'electricity', 'water', 'other') NOT NULL DEFAULT 'other',
    user_id INT NOT NULL,
    room_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm cột description nếu chưa tồn tại
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS description TEXT AFTER status;

-- Thêm index cho các cột thường xuyên tìm kiếm
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_room_id ON payments(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Cập nhật các bản ghi hiện có (nếu có)
UPDATE payments 
SET payment_type = 'room' 
WHERE payment_type = 'other' AND (description LIKE '%phòng%' OR description LIKE '%room%');

UPDATE payments 
SET payment_type = 'electricity' 
WHERE payment_type = 'other' AND (description LIKE '%điện%' OR description LIKE '%electricity%');

UPDATE payments 
SET payment_type = 'water' 
WHERE payment_type = 'other' AND (description LIKE '%nước%' OR description LIKE '%water%'); 