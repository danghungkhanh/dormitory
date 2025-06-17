<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

$user = getUserFromToken();
if (!$user) {
    sendResponse(false, 'Yêu cầu đăng nhập');
}

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Xử lý logic đăng ký nội trú tại đây
    // Ví dụ: Lưu thông tin vào bảng dorm_registrations
    
    sendResponse(true, 'Đăng ký nội trú thành công', $data);
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Lấy danh sách đăng ký nội trú của người dùng
    // Ví dụ: SELECT * FROM dorm_registrations WHERE user_id = $user['user_id']
    
    sendResponse(true, 'Danh sách đăng ký nội trú', []);
} else {
    sendResponse(false, 'Phương thức không hợp lệ');
} 