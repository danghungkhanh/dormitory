-- Kiểm tra và thêm cột payment_type nếu chưa tồn tại
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_type ENUM('room', 'electricity', 'water', 'other') NOT NULL DEFAULT 'other' AFTER id;

-- Kiểm tra và thêm cột status nếu chưa tồn tại
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending' AFTER amount;

-- Kiểm tra và thêm cột room_id nếu chưa tồn tại
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS room_id INT NULL AFTER user_id;

-- Thêm khóa ngoại sau khi đã thêm cột
ALTER TABLE payments
ADD CONSTRAINT fk_payments_room_id
FOREIGN KEY (room_id) REFERENCES rooms(id)
ON DELETE SET NULL;

-- Cập nhật các bản ghi hiện có
UPDATE payments 
SET payment_type = 'room' 
WHERE payment_type = 'other' AND description LIKE '%phòng%';

UPDATE payments 
SET payment_type = 'electricity' 
WHERE payment_type = 'other' AND description LIKE '%điện%';

UPDATE payments 
SET payment_type = 'water' 
WHERE payment_type = 'other' AND description LIKE '%nước%';

-- Thêm index cho các cột thường xuyên tìm kiếm
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_room_id ON payments(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at); 