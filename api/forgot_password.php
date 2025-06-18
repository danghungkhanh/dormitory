<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Chỉ chấp nhận yêu cầu POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.');
}

// Lấy dữ liệu JSON từ request body
$data = json_decode(file_get_contents('php://input'), true);

// Kiểm tra các trường bắt buộc
if (!isset($data['student_id']) || !isset($data['email'])) {
    sendResponse(false, 'Mã số sinh viên và email là bắt buộc.');
}

// Sanitize input
$student_id = sanitizeInput($data['student_id']);
$email = sanitizeInput($data['email']);

// Kiểm tra xem mã số sinh viên và email có khớp với tài khoản nào không
$stmt = $pdo->prepare("SELECT id FROM users WHERE student_id = ? AND email = ?");
$stmt->execute([$student_id, $email]);
$user = $stmt->fetch();

if (!$user) {
    sendResponse(false, 'Mã số sinh viên hoặc email không chính xác.');
}

// Tạo mật khẩu mới ngẫu nhiên
$new_password = generateRandomString(8);
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

// Cập nhật mật khẩu mới vào database
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
if ($stmt->execute([$hashed_password, $user['id']])) {
    sendResponse(true, 'Mật khẩu mới đã được tạo thành công.', [
        'new_password' => $new_password
    ]);
} else {
    sendResponse(false, 'Không thể cập nhật mật khẩu. Vui lòng thử lại sau.');
} 