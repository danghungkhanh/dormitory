-- Create database
CREATE DATABASE IF NOT EXISTS `dormitory_db`;
USE `dormitory_db`;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` VARCHAR(255) UNIQUE NOT NULL,
    `fullname` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `address` TEXT,
    `gender` ENUM('Nam', 'Nữ', 'Khác') ,
    `dob` DATE,
    `is_admin` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dorms table
CREATE TABLE IF NOT EXISTS `dorms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `address` TEXT,
    `total_rooms` INT DEFAULT 0
);

-- Create room_types table
CREATE TABLE IF NOT EXISTS `room_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `capacity` INT NOT NULL, -- Sức chứa
    `area` DECIMAL(10, 2), -- Diện tích
    `price` DECIMAL(10, 2) NOT NULL, -- Giá mỗi tháng
    `description` TEXT
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `dorm_id` INT NOT NULL,
    `room_number` VARCHAR(50) NOT NULL,
    `room_type_id` INT NOT NULL,
    `capacity` INT NOT NULL, -- Sức chứa của phòng (lấy từ room_types)
    `current_occupancy` INT DEFAULT 0, -- Số người hiện đang ở
    `status` ENUM('empty', 'occupied', 'full', 'maintenance') DEFAULT 'empty',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`dorm_id`) REFERENCES `dorms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON DELETE CASCADE,
    UNIQUE (`dorm_id`, `room_number`)
);

-- Create dorm_registrations table
CREATE TABLE IF NOT EXISTS `dorm_registrations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `companion_ids` TEXT, -- Các mã số sinh viên của người ở cùng, cách nhau bởi dấu phẩy
    `dorm_id` INT NOT NULL,
    `room_type_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `check_in_date` DATE NOT NULL,
    `duration` INT NOT NULL, -- Thời gian ở (tháng)
    `notes` TEXT,
    `agree_terms` TINYINT(1) NOT NULL DEFAULT 0,
    `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    `paid_amount` DECIMAL(10,2) DEFAULT 0.00, -- Thêm cột để theo dõi số tiền đã thanh toán
    FOREIGN KEY (`student_id`) REFERENCES `users`(`student_id`) ON DELETE CASCADE,
    FOREIGN KEY (`dorm_id`) REFERENCES `dorms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    payment_type ENUM('room', 'electricity', 'water', 'other', 'laundry') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    status ENUM('pending', 'completed', 'overdue') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Create utility_readings table for monthly electricity and water usage
CREATE TABLE IF NOT EXISTS `utility_readings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NOT NULL,
    `month` INT NOT NULL, /* Tháng của kỳ ghi nhận (1-12) */
    `year` INT NOT NULL, /* Năm của kỳ ghi nhận */
    `electricity_kwh` DECIMAL(10, 2) DEFAULT 0.00, /* Số kWh điện sử dụng */
    `water_m3` DECIMAL(10, 2) DEFAULT 0.00, /* Số m3 nước sử dụng */
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, /* Thời gian ghi nhận */
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
    UNIQUE (`room_id`, `month`, `year`) /* Đảm bảo mỗi phòng chỉ có một bản ghi cho mỗi tháng/năm */
);

-- Create laundry_registrations table
CREATE TABLE IF NOT EXISTS laundry_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    service_type ENUM('wash', 'dry', 'both') NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed') DEFAULT 'pending',
    estimated_completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Thêm hoặc cập nhật admin
INSERT INTO `users` (`student_id`, `fullname`, `email`, `password`, `is_admin`) VALUES
('admin001', 'Admin User', 'admin@humg.edu.vn', '$2y$10$iI8j9/vP.U7f.Qx9p5p05uT.Y/gD2f0N0P9G7Q.Y3s.p3w.5p3w', 1); -- password is 'password'

INSERT INTO `dorms` (`name`, `address`, `total_rooms`) VALUES
('Ký túc xá A', 'Số 1 Đường ABC, Hà Nội', 100),
('Ký túc xá B', 'Số 2 Đường XYZ, Hà Nội', 80);

INSERT INTO `room_types` (`name`, `capacity`, `area`, `price`, `description`) VALUES
('Phòng tiêu chuẩn', 4, 25.00, 1000000.00, 'Phòng 4 người, diện tích 25m2'),
('Phòng chất lượng cao', 2, 30.00, 1500000.00, 'Phòng 2 người, có điều hòa');

INSERT INTO `rooms` (`dorm_id`, `room_number`, `room_type_id`, `capacity`, `current_occupancy`, `status`) VALUES
(1, 'A101', 1, 4, 0, 'empty'),
(1, 'A102', 1, 4, 2, 'occupied'),
(1, 'A103', 2, 2, 0, 'empty'),
(2, 'B201', 1, 4, 4, 'full');

INSERT INTO `dorm_registrations` (`student_id`, `full_name`, `dorm_id`, `room_type_id`, `room_id`, `check_in_date`, `duration`, `status`, `paid_amount`) VALUES
('admin001', 'Admin User', 1, 1, 1, '2024-01-01', 1, 'approved', 0.00);